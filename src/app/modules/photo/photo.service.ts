// import axios from 'axios';
// import fs from 'fs';
// import { Photo } from './photo.model';
// import { bufferToBase64, createPrintLayout, downloadImageAsBuffer } from './photo.utils';
// import { PAPER_SIZE, PHOTO_STATUS } from './photo.constant';
// import { PhotoDocument, PhotoInput } from './photo.interface';
// import config from '../../config';
// import { downloadAndSaveProcessedImage } from '../../middlewares/parseFileData';
// import path from 'path';


// const createPhotoToDB = async (
//   data: Omit<PhotoInput, 'sizeInfo'> & {
//     sizeInfo: { name: string; mmWidth: number; mmHeight: number };
//   },
//   userId: string,
//   file?: Express.Multer.File
// ): Promise<PhotoDocument> => {
//   const { originalImage, photoType, bgColor = 'FFFFFF', copies = 1, sizeInfo, paperSize = PAPER_SIZE.FOUR_R } = data;

//   if (!file) throw new Error('No file provided');

//   const photo = new Photo({
//     userId,
//     originalImage,
//     country: 'Bangladesh',
//     photoType,
//     sizeInfo,
//     bgColor,
//     copies,
//     status: 'processing',
//     printOptions: {
//       paperSize,
//     },
//   });

//   await photo.save();

//   let buffer: Buffer;
//   if (file.buffer) buffer = file.buffer;
//   else if (file.path) buffer = fs.readFileSync(file.path);
//   else throw new Error('File buffer not found');

//   const base64Image = bufferToBase64(buffer);
//   const cleanBgColor = (bgColor || 'FFFFFF').replace('#', '').toUpperCase();

//   try {
//     const payload = {
//       base64: base64Image,
//       bgColor: cleanBgColor,
//       dpi: 300,
//       mmWidth: sizeInfo.mmWidth,
//       mmHeight: sizeInfo.mmHeight,
//     };

//     const response = await axios.post(config.cutout_pro_api_url!, payload, {
//       headers: {
//         'APIKEY': config.cutout_pro_api_key,
//         'Content-Type': 'application/json',
//       },
//       timeout: 35000,
//     });

//     const result = response.data;

//     if (result.code !== 0 || !result.data?.idPhotoImage) {
//       throw new Error(result.msg || 'Cutout Pro failed');
//     }

//     const singleImageUrl = result.data.idPhotoImage;

//     const singleBuffer = await downloadImageAsBuffer(singleImageUrl);
//     const layoutBuffer = await createPrintLayout(singleBuffer, sizeInfo, copies, paperSize);
    

//     // All formats
//     const singlePng = await downloadAndSaveProcessedImage(singleBuffer, userId, photoType, 'png');
//     const layoutPng = await downloadAndSaveProcessedImage(layoutBuffer, userId, photoType, 'layout');

//     const jpgUrl = await downloadAndSaveProcessedImage(layoutBuffer, userId, photoType, 'jpg');
//     const webpUrl = await downloadAndSaveProcessedImage(layoutBuffer, userId, photoType, 'webp');

//     photo.idPhotoImage = singlePng;
//     photo.printLayoutImage = layoutPng;

//     photo.pngUrl = singlePng;
//     photo.jpgUrl = jpgUrl;
//     photo.webpUrl = webpUrl;

//     photo.status = PHOTO_STATUS.SUCCESS;
//     photo.creditsUsed = 1;
//     photo.expiresAt = new Date(Date.now() + 30 * 60 * 1000);

//     await photo.save();
//     return photo;

//   } catch (error: any) {
//     photo.status = PHOTO_STATUS.FAILED;
//     photo.errorMessage = error.message;
//     await photo.save();
//     throw error;
//   }
// };

// const regeneratePrintLayoutLocal = async (
//   photoId: string,
//   newCopies: number | string,
//   paperSize: PAPER_SIZE = PAPER_SIZE.FOUR_R
// ): Promise<PhotoDocument> => {
//   // validate and parse inputs
//   const parsedCopies = Number(newCopies);
//   if (!Number.isInteger(parsedCopies) || parsedCopies < 1) {
//     throw new Error('newCopies must be a positive integer');
//   }

//   const photo = await Photo.findById(photoId);
//   if (!photo || !photo.idPhotoImage) throw new Error('Photo not found');

//   const singleImageFullPath = path.join(process.cwd(), photo.idPhotoImage.replace(/^\//, ''));

//   if (!fs.existsSync(singleImageFullPath)) throw new Error('Image file not found');

//   const singleBuffer = fs.readFileSync(singleImageFullPath);
//   const layoutBuffer = await createPrintLayout(singleBuffer, photo.sizeInfo, parsedCopies, paperSize as any);


//   const fileName = `${photo.userId}-layout-${parsedCopies}-${Date.now()}.png`;
//   const savePath = `/uploads/processedImage/${fileName}`;
//   const fullPath = path.join(process.cwd(), savePath.replace(/^\//, ''));

//   fs.mkdirSync(path.dirname(fullPath), { recursive: true });
//   fs.writeFileSync(fullPath, layoutBuffer);

//   photo.copies = parsedCopies;
//   photo.printLayoutImage = savePath;
//   photo.printOptions.paperSize = paperSize;
//   await photo.save();

//   return photo;
// };

// export const PhotoServices={
//     createPhotoToDB,
//     regeneratePrintLayoutLocal,
// }

import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { Photo } from './photo.model';
import { bufferToBase64, downloadImageAsBuffer, downloadAndSaveProcessedImage } from './photo.utils';
import { PAPER_SIZE, PHOTO_STATUS } from './photo.constant';
import { PhotoDocument, PhotoInput } from './photo.interface';
import config from '../../config';
import { selectTemplate } from './layouts/layouts.templateSelector';
import { DPI, RENDER_VERSION } from './layouts/layouts.constant';
import { calculateLayout } from './layouts/layouts.layoutEngine';
import { renderLayout } from './layouts/layouts.renderLayout';


const createPhotoToDB = async (
  data: Omit<PhotoInput, 'sizeInfo'> & {
    sizeInfo: { name: string; mmWidth: number; mmHeight: number };
  },
  userId: string,
  file?: Express.Multer.File
): Promise<PhotoDocument> => {
  const { originalImage, photoType, bgColor = 'FFFFFF', copies = 1, sizeInfo, paperSize = PAPER_SIZE.FOUR_R } = data;

  if (!file) throw new Error('No file provided');

  // Resolve the template up front so we fail fast (before calling the
  // paid Cutout Pro API) if an unsupported copies/paper/photoType
  // combination was requested.
  const template = selectTemplate({ photoType, paperSize, copies });

  const photo = new Photo({
    userId,
    originalImage,
    country: 'Bangladesh',
    photoType,
    sizeInfo,
    bgColor,
    copies,
    status: 'processing',
    printOptions: {
      paperSize,
      templateName: template.name,
      rows: template.rows,
      columns: template.columns,
      marginMm: template.marginMm,
      gapMm: template.gapMm,
      dpi: DPI,
      renderVersion: RENDER_VERSION,
    },
  });

  await photo.save();

  let buffer: Buffer;
  if (file.buffer) buffer = file.buffer;
  else if (file.path) buffer = fs.readFileSync(file.path);
  else throw new Error('File buffer not found');

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

    // ---- Layout Engine takes over from here; the service does no math ----
    const layout = calculateLayout(template, paperSize, sizeInfo, DPI);
    const layoutBuffer = await renderLayout(singleBuffer, layout, { copiesToRender: copies });

    const singlePng = await downloadAndSaveProcessedImage(singleBuffer, userId, photoType, 'png');
    const layoutPng = await downloadAndSaveProcessedImage(layoutBuffer, userId, photoType, 'layout');
    const jpgUrl = await downloadAndSaveProcessedImage(layoutBuffer, userId, photoType, 'jpg');
    const webpUrl = await downloadAndSaveProcessedImage(layoutBuffer, userId, photoType, 'webp');

    photo.idPhotoImage = singlePng;
    photo.printLayoutImage = layoutPng;

    photo.pngUrl = singlePng;
    photo.jpgUrl = jpgUrl;
    photo.webpUrl = webpUrl;

    photo.status = PHOTO_STATUS.SUCCESS;
    photo.creditsUsed = 1;
    photo.expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    await photo.save();
    return photo;
  } catch (error: any) {
    photo.status = PHOTO_STATUS.FAILED;
    photo.errorMessage = error.message;
    await photo.save();
    throw error;
  }
};

const regeneratePrintLayoutLocal = async (
  photoId: string,
  newCopies: number | string,
  paperSize: PAPER_SIZE = PAPER_SIZE.FOUR_R
): Promise<PhotoDocument> => {
  const parsedCopies = Number(newCopies);
  if (!Number.isInteger(parsedCopies) || parsedCopies < 1) {
    throw new Error('newCopies must be a positive integer');
  }

  const photo = await Photo.findById(photoId);
  if (!photo || !photo.idPhotoImage) throw new Error('Photo not found');

  const singleImageFullPath = path.join(process.cwd(), photo.idPhotoImage.replace(/^\//, ''));
  if (!fs.existsSync(singleImageFullPath)) throw new Error('Image file not found');

  const singleBuffer = fs.readFileSync(singleImageFullPath);

  const template = selectTemplate({
    photoType: photo.photoType,
    paperSize,
    copies: parsedCopies,
  });

  const layout = calculateLayout(template, paperSize, photo.sizeInfo, DPI);
  const layoutBuffer = await renderLayout(singleBuffer, layout, { copiesToRender: parsedCopies });

  const savePath = await downloadAndSaveProcessedImage(layoutBuffer, String(photo.userId), photo.photoType, 'layout');

  photo.copies = parsedCopies;
  photo.printLayoutImage = savePath;
  photo.printOptions = {
    paperSize,
    templateName: template.name,
    rows: template.rows,
    columns: template.columns,
    marginMm: template.marginMm,
    gapMm: template.gapMm,
    dpi: DPI,
    renderVersion: RENDER_VERSION,
  };

  await photo.save();
  return photo;
};

export const PhotoServices = {
  createPhotoToDB,
  regeneratePrintLayoutLocal,
};