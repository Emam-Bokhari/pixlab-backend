import sharp from 'sharp';
import { HttpError } from '../../errors/HttpError';
import { bufferToBase64Url, getFileExtension, getMimeType } from '../../shared/sendBinaryResponse';
import { ImageDetailsWithData, ReduceResult } from './reduce.interface';
import { ALLOWED_FORMATS, compressImageToTargetSize, getImageSizeInfo } from './reduce.utils';

const reduceImageSize = async (
  file?: Express.Multer.File,
  targetSizeKbInput?: unknown,
): Promise<ReduceResult> => {
  if (!file || !file.buffer) {
    throw new HttpError(400, 'No image file provided');
  }

  const targetSizeKb = Number(targetSizeKbInput);
  if (!targetSizeKb || targetSizeKb <= 0) {
    throw new HttpError(400, 'targetSizeKb must be a positive number');
  }

  const buffer = file.buffer;

  let metadata: sharp.Metadata;
  try {
    metadata = await sharp(buffer).metadata();
    if (!metadata.format || !ALLOWED_FORMATS.includes(metadata.format.toLowerCase())) {
      throw new Error('Unsupported image format. Allowed: PNG, JPG, JPEG, BMP, WEBP');
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Invalid or unsupported image file';
    throw new HttpError(400, message);
  }

  const originalInfo = await getImageSizeInfo(buffer);
  const compressionResult = await compressImageToTargetSize(buffer, targetSizeKb, metadata.format);
  const reducedInfo = await getImageSizeInfo(compressionResult.buffer);

  const reductionPercentage =
    originalInfo.sizeBytes > 0
      ? Number(
          (
            ((originalInfo.sizeBytes - reducedInfo.sizeBytes) / originalInfo.sizeBytes) *
            100
          ).toFixed(2),
        )
      : 0;

  const originalMime = file.mimetype || getMimeType(metadata.format);
  const reducedMime = getMimeType(compressionResult.format);
  const ext = getFileExtension(compressionResult.format);

  const originalData: ImageDetailsWithData = {
    ...originalInfo,
    format: originalMime.split('/')[1] || 'jpeg',
    imageUrl: bufferToBase64Url(buffer, originalMime),
  };

  const currentData: ImageDetailsWithData = {
    ...reducedInfo,
    format: compressionResult.format,
    imageUrl: bufferToBase64Url(compressionResult.buffer, reducedMime),
  };

  return {
    binary: {
      buffer: compressionResult.buffer,
      filename: `reduced.${ext}`,
      contentType: reducedMime,
      original: originalData,
      processed: currentData,
      processedPrefix: 'Reduced',
      extraHeaders: {
        'X-Reduction-Percent': reductionPercentage,
        'X-Target-Size-KB': targetSizeKb,
      },
    },
    data: {
      original: originalData,
      current: currentData,
      targetSizeKb,
      reductionPercentage,
    },
  };
};

export const ReduceServices = {
  reduceImageSize,
};
