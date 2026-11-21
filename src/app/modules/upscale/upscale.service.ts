import sharp from 'sharp';
import { HttpError } from '../../errors/HttpError';
import { bufferToBase64Url, getFileExtension, getMimeType } from '../../shared/sendBinaryResponse';
import { ImageDimensionInfoWithData, UpscaleResult } from './upscale.interface';
import { getImageDimensionInfo } from './upscale.utils';

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

  let format = originalFormat.toLowerCase();
  if (format === 'jpg') format = 'jpeg';

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
  requestedScale?: unknown,
): Promise<UpscaleResult> => {
  if (!file || !file.buffer) {
    throw new HttpError(400, 'No image file provided');
  }

  const parsedScale = Number(requestedScale);
  const scale = parsedScale >= 1 && parsedScale <= 4 ? parsedScale : 2;

  const originalBuffer = file.buffer;
  const fileSizeMB = originalBuffer.length / (1024 * 1024);

  if (fileSizeMB > MAX_FILE_SIZE_MB) {
    throw new HttpError(400, `Image exceeds max allowed size of ${MAX_FILE_SIZE_MB}MB`);
  }

  let metadata: sharp.Metadata;
  try {
    metadata = await sharp(originalBuffer).metadata();
    if (!metadata.format || !ALLOWED_FORMATS.includes(metadata.format.toLowerCase())) {
      throw new Error(`Unsupported image format. Allowed: ${ALLOWED_FORMATS.join(', ')}`);
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Invalid or unsupported image file';
    throw new HttpError(400, message);
  }

  const originalInfo = await getImageDimensionInfo(originalBuffer);
  const { buffer: upscaledBuffer, format } = await performUpscale(
    originalBuffer,
    scale,
    metadata.format,
  );
  const upscaledInfo = await getImageDimensionInfo(upscaledBuffer);

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

  const originalFormat =
    originalInfo.format || (file.mimetype ? file.mimetype.split('/')[1] : 'jpeg') || 'jpeg';
  const originalMime = file.mimetype || getMimeType(originalFormat);
  const upscaledMime = getMimeType(format);
  const ext = getFileExtension(format);

  const originalData: ImageDimensionInfoWithData = {
    ...originalInfo,
    format: originalFormat,
    imageUrl: bufferToBase64Url(originalBuffer, originalMime),
  };

  const currentData: ImageDimensionInfoWithData = {
    ...upscaledInfo,
    format,
    imageUrl: bufferToBase64Url(upscaledBuffer, upscaledMime),
  };

  const increase = {
    widthPercent,
    heightPercent,
    sizeBytesPercent,
    sizeMBDiff,
  };

  return {
    binary: {
      buffer: upscaledBuffer,
      filename: `upscaled.${ext}`,
      contentType: upscaledMime,
      original: originalData,
      processed: currentData,
      processedPrefix: 'Upscaled',
      extraHeaders: {
        'X-Scale': scale,
        'X-Width-Increase-Percent': widthPercent,
        'X-Height-Increase-Percent': heightPercent,
        'X-Size-Increase-Percent': sizeBytesPercent,
        'X-Size-MB-Diff': sizeMBDiff,
      },
    },
    data: {
      original: originalData,
      current: currentData,
      scale,
      increase,
    },
  };
};

export const UpscaleServices = {
  upscaleImage,
};
