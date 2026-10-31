import fs from 'fs';
import sharp from 'sharp';
import { HttpError } from '../../errors/HttpError';
import { Reduce } from './reduce.model';
import { ReduceDocument } from './reduce.interface';
import { compressImageToTargetSize, saveReducedImage, getImageSizeInfo } from './reduce.utils';
import path from 'path';

const ALLOWED_FORMATS = ['png', 'jpeg', 'jpg', 'bmp', 'webp'];

const reduceImageSize = async (
  data: { targetSizeKb: number; image: string },
): Promise<ReduceDocument> => {
  const { targetSizeKb, image } = data;

  if (!image) {
    throw new HttpError(400, 'No image path provided');
  }

  const filePath = path.join(process.cwd(), image);
  if (!fs.existsSync(filePath)) {
    throw new HttpError(404, 'Uploaded image file not found on server');
  }

  // Read buffer
  const buffer = fs.readFileSync(filePath);

  // Validate format using sharp
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

  // Compress image
  const compressionResult = await compressImageToTargetSize(buffer, targetSizeKb, metadata.format);

  // Save the reduced image
  const reducedImageUrl = await saveReducedImage(
    compressionResult.buffer,
    compressionResult.format,
  );

  const reducedInfo = await getImageSizeInfo(compressionResult.buffer);

  // Calculate stats
  const originalSize = originalInfo.sizeBytes;
  const reducedSize = reducedInfo.sizeBytes;

  // Guard against division by zero
  const reductionPercentage =
    originalSize > 0 ? Number((((originalSize - reducedSize) / originalSize) * 100).toFixed(2)) : 0;

  // Save to database
  const reduceRecord = new Reduce({
    originalImageName: path.basename(image),
    reducedImageUrl,
    original: originalInfo,
    reduced: reducedInfo,
    reductionPercentage,
    targetSizeKb,
    format: compressionResult.format === 'jpeg' ? 'jpg' : compressionResult.format,
  });

  await reduceRecord.save();

  return reduceRecord;
};

const getAllReducedImages = async () => {
  const records = await Reduce.find().sort({ createdAt: -1 }).exec();
  return records;
};

export const ReduceServices = {
  reduceImageSize,
  getAllReducedImages,
};
