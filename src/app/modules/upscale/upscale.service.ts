import fs from 'fs';
import sharp from 'sharp';
import { HttpError } from '../../errors/HttpError';
import { UPSCALE_STATUS } from './upscale.constant';
import {
  saveOriginalImage,
  saveUpscaledImage,
  getImageDimensionInfo,
} from './upscale.utils';
import { TUpscale } from './upscale.interface';
import { Upscale } from './upscale.model';
import { generateUpscalePhotoId } from '../../utils/generateYearBasedId';

const ALLOWED_FORMATS = ['png', 'jpeg', 'jpg', 'bmp', 'webp', 'tiff', 'avif'];
const MAX_FILE_SIZE_MB = 20;

const performUpscale = async (
  buffer: Buffer,
  scale: number,
  originalFormat: string,
): Promise<{ buffer: Buffer; format: string }> => {
  const metadata = await sharp(buffer).metadata();
  const originalWidth = metadata.width || 800;
  const originalHeight = metadata.height || 600;

  const targetWidth = Math.round(originalWidth * scale);
  const targetHeight = Math.round(originalHeight * scale);

  // lanczos3 resampling with unsharp masking for edge enhancement
  let pipeline = sharp(buffer)
    .rotate()
    .resize({
      width: targetWidth,
      height: targetHeight,
      kernel: sharp.kernel.lanczos3,
      fit: 'fill',
    })
    .sharpen({
      sigma: 1.2,
      m1: 1.0,
      m2: 2.0,
    });

  let format = originalFormat.toLowerCase();
  if (format === 'jpg') format = 'jpeg';

  switch (format) {
    case 'jpeg':
      pipeline = pipeline.jpeg({ quality: 95, mozjpeg: true });
      break;
    case 'webp':
      pipeline = pipeline.webp({ quality: 95, effort: 6 });
      break;
    case 'avif':
      pipeline = pipeline.avif({ quality: 95 });
      break;
    case 'tiff':
      pipeline = pipeline.tiff({ quality: 95 });
      break;
    default:
      format = 'png';
      pipeline = pipeline.png({ quality: 100, compressionLevel: 6 });
      break;
  }

  const outputBuffer = await pipeline.toBuffer();
  return { buffer: outputBuffer, format };
};

const upscaleImage = async (
  file?: Express.Multer.File,
  requestedScale: number = 2,
): Promise<TUpscale> => {
  if (!file) throw new HttpError(400, 'No file provided');

  const parsedScale = Number(requestedScale);
  const scale = parsedScale >= 1 && parsedScale <= 4 ? parsedScale : 2;

  let originalBuffer: Buffer;
  if (file.buffer) originalBuffer = file.buffer;
  else if (file.path) originalBuffer = fs.readFileSync(file.path);
  else throw new HttpError(400, 'File buffer not found');

  const fileSizeMB = originalBuffer.length / (1024 * 1024);
  if (fileSizeMB > MAX_FILE_SIZE_MB) {
    throw new HttpError(400, `Image exceeds max allowed size of ${MAX_FILE_SIZE_MB}MB`);
  }

  let metadata;
  try {
    metadata = await sharp(originalBuffer).metadata();
    if (!metadata.format || !ALLOWED_FORMATS.includes(metadata.format.toLowerCase())) {
      throw new Error(`Unsupported image format. Allowed: ${ALLOWED_FORMATS.join(', ')}`);
    }
  } catch (err: any) {
    throw new HttpError(400, err.message || 'Invalid or unsupported image file');
  }

  const upscaledPhotoId = await generateUpscalePhotoId();
  const originalImagePath = await saveOriginalImage(originalBuffer, upscaledPhotoId);
  const originalInfo = await getImageDimensionInfo(originalBuffer);

  const upscaleDoc = new Upscale({
    originalImage: originalImagePath,
    upscaledPhotoId,
    scale,
    status: UPSCALE_STATUS.PENDING,
  });
  await upscaleDoc.save();

  upscaleDoc.status = UPSCALE_STATUS.PROCESSING;
  await upscaleDoc.save();

  try {
    const { buffer: upscaledBuffer, format } = await performUpscale(
      originalBuffer,
      scale,
      metadata.format,
    );

    const upscaledInfo = await getImageDimensionInfo(upscaledBuffer);
    const upscaledImageUrl = await saveUpscaledImage(upscaledBuffer, upscaledPhotoId, format);

    const widthPercent = originalInfo.widthPx
      ? Number(
          (((upscaledInfo.widthPx - originalInfo.widthPx) / originalInfo.widthPx) * 100).toFixed(2),
        )
      : 0;
    const heightPercent = originalInfo.heightPx
      ? Number(
          (((upscaledInfo.heightPx - originalInfo.heightPx) / originalInfo.heightPx) * 100).toFixed(
            2,
          ),
        )
      : 0;
    const sizeBytesPercent = originalInfo.sizeBytes
      ? Number(
          (
            ((upscaledInfo.sizeBytes - originalInfo.sizeBytes) / originalInfo.sizeBytes) *
            100
          ).toFixed(2),
        )
      : 0;
    const sizeMBDiff = Number((upscaledInfo.sizeMB - originalInfo.sizeMB).toFixed(3));

    upscaleDoc.upscaledImage = upscaledImageUrl;
    upscaleDoc.original = originalInfo;
    upscaleDoc.upscaled = upscaledInfo;
    upscaleDoc.increase = { widthPercent, heightPercent, sizeBytesPercent, sizeMBDiff };
    upscaleDoc.didUpscale = true;
    upscaleDoc.status = UPSCALE_STATUS.SUCCESS;

    await upscaleDoc.save();

    return upscaleDoc;
  } catch (error: any) {
    upscaleDoc.status = UPSCALE_STATUS.FAILED;
    upscaleDoc.errorMessage = error.message;
    await upscaleDoc.save();
    throw new HttpError(500, error.message || 'Image upscale failed');
  }
};

const getAllUpscales = async () => {
  const upscales = await Upscale.find().sort({ createdAt: -1 }).exec();
  return upscales;
};

export const UpscaleServices = {
  upscaleImage,
  getAllUpscales,
};
