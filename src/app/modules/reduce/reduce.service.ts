import fs from 'fs';
import sharp from 'sharp';
import mongoose from 'mongoose';
import { HttpError } from '../../errors/HttpError';
import { Reduce } from './reduce.model';
import { ReduceDocument } from './reduce.interface';
import { compressImageToTargetSize, saveReducedImage, getImageSizeInfo } from './reduce.utils';
import { WalletServices } from '../wallet/wallet.service';
import { User } from '../user/user.model';

import path from 'path';

const ALLOWED_FORMATS = ['png', 'jpeg', 'jpg', 'bmp', 'webp'];

const reduceImageSize = async (
  userId: string,
  data: { targetSizeKb: number; image: string }
): Promise<ReduceDocument> => {
  const { targetSizeKb, image } = data;

  if (!image) {
    throw new HttpError(400, 'No image path provided');
  }

  // Check user exists
  const user = await User.findById(userId);
  if (!user) {
    throw new HttpError(404, 'User not found');
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
  const compressionResult = await compressImageToTargetSize(
    buffer,
    targetSizeKb,
    metadata.format
  );

  // Save the reduced image
  const reducedImageUrl = await saveReducedImage(
    compressionResult.buffer,
    userId,
    compressionResult.format
  );

  const reducedInfo = await getImageSizeInfo(compressionResult.buffer);

  // Calculate stats
  const originalSize = originalInfo.sizeBytes;
  const reducedSize = reducedInfo.sizeBytes;
  
  // Guard against division by zero
  const reductionPercentage = originalSize > 0
    ? Number((((originalSize - reducedSize) / originalSize) * 100).toFixed(2))
    : 0;

  // Save to database
  const reduceRecord = new Reduce({
    userId: new mongoose.Types.ObjectId(userId),
    originalImageName: path.basename(image),
    reducedImageUrl,
    original: originalInfo,
    reduced: reducedInfo,
    reductionPercentage,
    targetSizeKb,
    format: compressionResult.format === 'jpeg' ? 'jpg' : compressionResult.format,
  });

  await reduceRecord.save();

  // Deduct credits for the reduce operation
  // await WalletServices.deductCreditsForOperation(userId, 'reduce');

  return reduceRecord;
};

const getAllReducedImagesForUser = async (userId: string) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new HttpError(404, 'User not found');
  }

  const records = await Reduce.find({ userId }).sort({ createdAt: -1 }).exec();
  return records;
};

export const ReduceServices = {
  reduceImageSize,
  getAllReducedImagesForUser,
};
