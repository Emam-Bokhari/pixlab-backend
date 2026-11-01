import sharp from 'sharp';
import { HttpError } from '../../errors/HttpError';
import { ReduceResult } from './reduce.interface';
import { compressImageToTargetSize, getImageSizeInfo, ALLOWED_FORMATS } from './reduce.utils';

const reduceImageSize = async (
  file: Express.Multer.File,
  targetSizeKb: number,
): Promise<ReduceResult> => {
  if (!file || !file.buffer) {
    throw new HttpError(400, 'No image file provided');
  }

  const buffer = file.buffer;

  let metadata;
  try {
    metadata = await sharp(buffer).metadata();
    if (!metadata.format || !ALLOWED_FORMATS.includes(metadata.format.toLowerCase())) {
      throw new Error('Unsupported image format. Allowed: PNG, JPG, JPEG, BMP, WEBP');
    }
  } catch (err: any) {
    throw new HttpError(400, err.message || 'Invalid or unsupported image file');
  }

  const originalInfo = await getImageSizeInfo(buffer);
  const compressionResult = await compressImageToTargetSize(buffer, targetSizeKb, metadata.format);
  const reducedInfo = await getImageSizeInfo(compressionResult.buffer);

  const reductionPercentage =
    originalInfo.sizeBytes > 0
      ? Number((((originalInfo.sizeBytes - reducedInfo.sizeBytes) / originalInfo.sizeBytes) * 100).toFixed(2))
      : 0;

  return {
    buffer: compressionResult.buffer,
    format: compressionResult.format,
    original: originalInfo,
    reduced: reducedInfo,
    reductionPercentage,
    targetSizeKb,
  };
};

export const ReduceServices = {
  reduceImageSize,
};
