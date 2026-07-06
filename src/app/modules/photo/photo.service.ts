import axios from 'axios';
import fs from 'fs';
import sharp from 'sharp';
import { Photo } from './photo.model';
import { WalletServices } from '../wallet/wallet.service';
import { CreditSetting } from '../creditSetting/creditSetting.model';
import {
  bufferToBase64,
  downloadImageAsBuffer,
  downloadAndSaveProcessedImage,
  downloadAndSavePdf,
  readSavedFileBuffer,
} from './photo.utils';
import { PAPER_SIZE, PHOTO_STATUS } from './photo.constant';
import { PhotoDocument, PhotoInput } from './photo.interface';
import config from '../../config';
import { selectTemplate } from './layouts/layouts.templateSelector';
import { DPI, RENDER_VERSION } from './layouts/layouts.constant';
import { calculateLayout } from './layouts/layouts.layoutEngine';
import { renderLayout } from './layouts/layouts.renderLayout';
import { renderLayoutPdf } from './pdf/pdf.renderPdf';
import { LayoutResult } from './layouts/layouts.type';
import { HttpError } from '../../errors/HttpError';
import { photoQueue } from '../../../queues';
import { User } from '../user/user.model';

// ---------------------------------------------------------------------
// STEP 1 — base endpoint. Only talks to Cutout Pro and saves the single
// background-removed photo (resized to sizeInfo). No layout compositing,
// no format conversion, no PDF — those are separate endpoints below so
// this one responds as fast as possible.
// ---------------------------------------------------------------------
const createPhotoToDB = async (
  data: Omit<PhotoInput, 'sizeInfo'> & {
    sizeInfo: { name: string; mmWidth: number; mmHeight: number };
  },
  userId: string,
  file?: Express.Multer.File,
): Promise<PhotoDocument> => {
  const {
    originalImage,
    photoType,
    bgColor = 'FFFFFF',
    copies = 1,
    sizeInfo,
    paperSize = PAPER_SIZE.FOUR_R,
  } = data;

  if (!file) throw new HttpError(400, 'No file provided');

  // Validate Cutout Pro config is present
  if (!config.cutout_pro_api_url || !config.cutout_pro_api_key) {
    throw new HttpError(500, 'Cutout Pro configuration is missing');
  }

  // Validate image
  let buffer: Buffer;
  if (file.buffer) buffer = file.buffer;
  else if (file.path) buffer = fs.readFileSync(file.path);
  else throw new Error('File buffer not found');

  try {
    const metadata = await sharp(buffer).metadata();

    // Check format
    const allowedFormats = ['png', 'jpeg', 'jpg', 'webp', 'bmp'];
    if (!metadata.format || !allowedFormats.includes(metadata.format.toLowerCase())) {
      throw new Error('Unsupported image format');
    }
  } catch (err: any) {
    throw new HttpError(400, err.message || 'Invalid or unsupported image file');
  }

  const photo = new Photo({
    userId,
    originalImage,
    country: 'Bangladesh',
    photoType,
    sizeInfo,
    bgColor,
    copies,
    paperSize,
    status: PHOTO_STATUS.PENDING,
    // printOptions intentionally left unset — the template is only
    // resolved once a layout is actually requested (see
    // ensurePrintLayoutBuffer below).
  });

  await photo.save();

  // Enqueue background job for processing
  await photoQueue.add('processPhoto', {
    photoId: photo._id,
    userId,
    bgColor,
    sizeInfo,
    filePath: file.path || null,
  });

  return photo;
};

// Background processing function for Cutout Pro
export const processPhoto = async (
  photoId: string,
  userId: string,
  bgColor: string,
  sizeInfo: { name: string; mmWidth: number; mmHeight: number },
  filePath: string | null,
) => {
  const photo = await Photo.findById(photoId);
  if (!photo) {
    throw new Error('Photo not found');
  }
  photo.status = PHOTO_STATUS.PROCESSING;
  await photo.save();

  let buffer: Buffer;
  if (filePath) {
    buffer = fs.readFileSync(filePath);
  } else {
    // If buffer wasn't saved, but we have originalImage, maybe?
    // Well, file should have been saved via multer, so filePath should exist
    throw new Error('File not found');
  }

  const base64Image = bufferToBase64(buffer);
  const cleanBgColor = (bgColor || 'FFFFFF').replace('#', '').toUpperCase();

  try {
    const payload = {
      base64: base64Image,
      bgColor: cleanBgColor,
      dpi: DPI,
      mmWidth: sizeInfo.mmWidth,
      mmHeight: sizeInfo.mmHeight,
    };

    const response = await axios.post(config.cutout_pro_api_url!, payload, {
      headers: {
        APIKEY: config.cutout_pro_api_key,
        'Content-Type': 'application/json',
      },
      timeout: 35000,
    });

    const result = response.data;

    if (result.code !== 0 || !result.data?.idPhotoImage) {
      throw new Error(result.msg || 'Cutout Pro failed');
    }

    const singleImageUrl = result.data.idPhotoImage;
    const singleBuffer = await downloadImageAsBuffer(singleImageUrl);
    const singlePng = await downloadAndSaveProcessedImage(
      singleBuffer,
      userId,
      photo.photoType,
      'png',
    );

    photo.idPhotoImage = singlePng;
    photo.pngUrl = singlePng;
    photo.status = PHOTO_STATUS.SUCCESS;
    
    // Fetch setting and deduct credits
    const setting = await CreditSetting.findOne({ key: 'photo_resize' });
    const requiredCredits = setting ? setting.credits : 1;
    await WalletServices.deductCreditsForOperation(userId, 'photo_resize', { photoId: photo._id });
    
    photo.creditsUsed = requiredCredits;
    photo.expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    await photo.save();
  } catch (error: any) {
    photo.status = PHOTO_STATUS.FAILED;
    photo.errorMessage = error.message;
    await photo.save();
    throw error;
  }
};

export interface LayoutOverride {
  copies?: number;
  paperSize?: PAPER_SIZE;
}

// ---------------------------------------------------------------------
// Shared internal helper — used by print-layout, converter, and pdf.
// Reuses the already-saved sheet (photo.printLayoutImage) if one exists
// AND the caller didn't ask for different copies/paperSize; otherwise
// resolves the template + (re)renders it and caches the result.
//
// This is what lets:
//  - converter/pdf work even if the user never clicked "Print Layout" first
//  - "Print Layout" / "Generate PDF" accept their own copies/paperSize
//    on demand, instead of always using whatever was set at creation time
// ---------------------------------------------------------------------
export const ensurePrintLayoutBuffer = async (
  photo: PhotoDocument,
  override?: LayoutOverride,
): Promise<{ layoutBuffer: Buffer; layout: LayoutResult }> => {
  if (!photo.idPhotoImage) {
    throw new HttpError(400, 'Base image not generated yet — call the create endpoint first');
  }

  const requestedCopies = override?.copies ?? photo.copies!;

  const requestedPaperSize =
    override?.paperSize ?? (photo.paperSize as PAPER_SIZE) ?? PAPER_SIZE.FOUR_R;

  if (!Number.isInteger(requestedCopies) || requestedCopies < 1) {
    throw new HttpError(400, 'copies must be a positive integer');
  }

  // Resolve + validate the template up front — fails fast on an
  // unsupported copies/paperSize/photoType combination.
  const template = selectTemplate({
    photoType: photo.photoType,
    paperSize: requestedPaperSize,
    copies: requestedCopies,
  });

  const layout = calculateLayout(template, requestedPaperSize, photo.sizeInfo, DPI);

  const settingsChanged =
    requestedCopies !== photo.copies || requestedPaperSize !== photo.paperSize;

  // Reuse the cached sheet only if the requested settings match what's
  // already saved.
  if (!settingsChanged && photo.printLayoutImage) {
    const layoutBuffer = readSavedFileBuffer(photo.printLayoutImage);
    return { layoutBuffer, layout };
  }

  const singleBuffer = readSavedFileBuffer(photo.idPhotoImage);
  const layoutBuffer = await renderLayout(singleBuffer, layout, {
    copiesToRender: requestedCopies,
  });

  const layoutPng = await downloadAndSaveProcessedImage(
    layoutBuffer,
    String(photo.userId),
    photo.photoType,
    'layout',
  );

  photo.copies = requestedCopies;
  photo.paperSize = requestedPaperSize;
  photo.printLayoutImage = layoutPng;
  photo.printOptions = {
    paperSize: requestedPaperSize,
    templateName: template.name,
    rows: template.rows,
    columns: template.columns,
    marginMm: template.marginMm,
    gapMm: template.gapMm,
    orientation: template.orientation,
    dpi: DPI,
    renderVersion: RENDER_VERSION,
  };

  // The sheet just changed — previously converted/pdf outputs no
  // longer match it, so drop them. They'll be lazily rebuilt next time
  // converter/pdf is called.
  if (settingsChanged) {
    photo.jpgUrl = '';
    photo.webpUrl = '';
    photo.pdfUrl = '';
  }

  await photo.save();

  return { layoutBuffer, layout };
};

// ---------------------------------------------------------------------
// STEP 2 — "Print Layout" button. Composites the studio sheet (centered
// grid) if it doesn't exist yet, and returns its URL. Independent of
// converter/pdf.
// ---------------------------------------------------------------------
const generatePrintLayout = async (
  photoId: string,
  userId: string,
  override?: LayoutOverride,
): Promise<PhotoDocument> => {
  const photo = await Photo.findById(photoId);

  if (!photo || !photo.idPhotoImage)
    throw new HttpError(404, 'Photo not found or base image not generated yet');

  if (String(photo.userId) !== userId)
    throw new HttpError(403, 'Not authorized to access this photo');

  const originalCopies = photo.copies;
  const originalPaperSize = photo.paperSize;

  await ensurePrintLayoutBuffer(photo, override);

  const settingsChanged =
    (override?.copies !== undefined && override.copies !== originalCopies) ||
    (override?.paperSize !== undefined && override.paperSize !== originalPaperSize);

  if (settingsChanged) {
    await photoQueue.add('regenerateFormats', { photoId, userId });
  }

  return photo;
};

// ---------------------------------------------------------------------
// STEP 3 — "Converter" button. Produces png/jpg/webp of the print
// layout sheet. Independent of the pdf endpoint.
// ---------------------------------------------------------------------
const convertPrintLayout = async (
  photoId: string,
  userId: string,
  override?: LayoutOverride,
): Promise<{ pngUrl: string; jpgUrl: string; webpUrl: string }> => {
  const photo = await Photo.findById(photoId);

  if (!photo || !photo.idPhotoImage)
    throw new HttpError(404, 'Photo not found or base image not generated yet');

  if (String(photo.userId) !== userId)
    throw new HttpError(403, 'Not authorized to access this photo');

  const { layoutBuffer } = await ensurePrintLayoutBuffer(photo, override);

  const [pngUrl, jpgUrl, webpUrl] = await Promise.all([
    downloadAndSaveProcessedImage(layoutBuffer, String(photo.userId), photo.photoType, 'png'),
    downloadAndSaveProcessedImage(layoutBuffer, String(photo.userId), photo.photoType, 'jpg'),
    downloadAndSaveProcessedImage(layoutBuffer, String(photo.userId), photo.photoType, 'webp'),
  ]);

  photo.jpgUrl = jpgUrl;
  photo.webpUrl = webpUrl;
  await photo.save();

  return { pngUrl, jpgUrl, webpUrl };
};

// ---------------------------------------------------------------------
// STEP 4 — "Generate PDF" button. Independent of converter/print-layout.
// ---------------------------------------------------------------------
const generatePdf = async (
  photoId: string,
  userId: string,
  override?: LayoutOverride,
): Promise<string> => {
  const photo = await Photo.findById(photoId);

  if (!photo || !photo.idPhotoImage)
    throw new HttpError(404, 'Photo not found or base image not generated yet');

  if (String(photo.userId) !== userId)
    throw new HttpError(403, 'Not authorized to access this photo');

  const originalCopies = photo.copies;
  const originalPaperSize = photo.paperSize;

  const { layoutBuffer, layout } = await ensurePrintLayoutBuffer(photo, override);

  const settingsChanged =
    (override?.copies !== undefined && override.copies !== originalCopies) ||
    (override?.paperSize !== undefined && override.paperSize !== originalPaperSize);

  const pdfBuffer = await renderLayoutPdf(layoutBuffer, layout);
  const pdfUrl = await downloadAndSavePdf(pdfBuffer, String(photo.userId), photo.photoType);

  if (settingsChanged || !photo.jpgUrl || !photo.webpUrl) {
    const [jpgUrl, webpUrl] = await Promise.all([
      downloadAndSaveProcessedImage(layoutBuffer, String(photo.userId), photo.photoType, 'jpg'),
      downloadAndSaveProcessedImage(layoutBuffer, String(photo.userId), photo.photoType, 'webp'),
    ]);
    photo.jpgUrl = jpgUrl;
    photo.webpUrl = webpUrl;
  }

  photo.pdfUrl = pdfUrl;
  await photo.save();

  return pdfUrl;
};

// ---------------------------------------------------------------------
// Change copies/paperSize after the fact. Invalidates previously
// rendered outputs (they no longer match) instead of eagerly
// re-rendering everything — the next print-layout/converter/pdf call
// will lazily regenerate from the new settings.
// ---------------------------------------------------------------------
const regeneratePrintLayoutLocal = async (
  photoId: string,
  userId: string,
  newCopies: number | string,
  paperSize?: PAPER_SIZE,
): Promise<PhotoDocument> => {
  const parsedCopies = Number(newCopies);

  if (!Number.isInteger(parsedCopies) || parsedCopies < 1) {
    throw new HttpError(400, 'newCopies must be a positive integer');
  }

  const photo = await Photo.findById(photoId);

  if (!photo || !photo.idPhotoImage)
    throw new HttpError(404, 'Photo not found or base image not generated yet');

  if (String(photo.userId) !== userId)
    throw new HttpError(403, 'Not authorized to access this photo');

  const resolvedPaperSize = paperSize ?? (photo.paperSize as PAPER_SIZE) ?? PAPER_SIZE.FOUR_R;

  // Validate the new combination has a real template before committing —
  // fail fast instead of silently keeping stale/mismatched output.
  selectTemplate({
    photoType: photo.photoType,
    paperSize: resolvedPaperSize,
    copies: parsedCopies,
  });

  photo.copies = parsedCopies;
  photo.paperSize = resolvedPaperSize;
  photo.printLayoutImage = undefined;
  photo.printOptions = undefined;

  await photo.save();

  await photoQueue.add('regenerateFormats', { photoId, userId });

  return photo;
};

const getAllPhotosForUser = async (userId: string) => {
  // check if the user exists
  const user = await User.findById(userId);
  if (!user) {
    throw new HttpError(404, 'User not found');
  }

  const photos = await Photo.find({ userId }).sort({ createdAt: -1 }).exec();
  // check if the user has any photos
  if (photos.length === 0) {
    throw new HttpError(404, 'No photos found for this user');
  }
  return photos;
};

export const PhotoServices = {
  createPhotoToDB,
  generatePrintLayout,
  convertPrintLayout,
  generatePdf,
  regeneratePrintLayoutLocal,
  getAllPhotosForUser,
};
