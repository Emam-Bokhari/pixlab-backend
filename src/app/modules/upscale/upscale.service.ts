import fs from 'fs';
import sharp from 'sharp';
import axios from 'axios';
import FormData from 'form-data';
import mongoose from 'mongoose';
import config from '../../config';
import { HttpError } from '../../errors/HttpError';
import {
  downloadImageAsBuffer,
  saveUpscaledImage,
  getImageDimensionInfo,
} from './upscale.utils';
import { Upscale } from './upscale.model';
import { UpscaleDocument } from './upscale.interface';
import { User } from '../user/user.model';

const ALLOWED_FORMATS = ['png', 'jpeg', 'jpg', 'bmp', 'webp'];
const MAX_DIMENSION = 4096; // docs: max uploaded resolution 4096x4096
const MAX_FILE_SIZE_MB = 15; // docs: max file size 15MB

const upscaleImage = async (
  userId: string,
  file?: Express.Multer.File,
): Promise<UpscaleDocument> => {
  if (!file) throw new HttpError(400, 'No file provided');

  if (!config.cutout_pro_upscale_api_url || !config.cutout_pro_api_key) {
    throw new HttpError(500, 'Cutout Pro upscale configuration is missing');
  }

  // check if the user exists
  const user = await User.findById(userId);
  if (!user) {
    throw new HttpError(404, 'User not found');
  }

  // --- read original buffer ---
  let originalBuffer: Buffer;
  if (file.buffer) originalBuffer = file.buffer;
  else if (file.path) originalBuffer = fs.readFileSync(file.path);
  else throw new HttpError(400, 'File buffer not found');

  // --- validate size (docs: < 15MB) ---
  const fileSizeMB = originalBuffer.length / (1024 * 1024);
  if (fileSizeMB > MAX_FILE_SIZE_MB) {
    throw new HttpError(400, `Image exceeds max allowed size of ${MAX_FILE_SIZE_MB}MB`);
  }

  // --- validate format + resolution (docs: PNG/JPG/JPEG/BMP/WEBP, max 4096x4096) ---
  let metadata;
  try {
    metadata = await sharp(originalBuffer).metadata();
    if (!metadata.format || !ALLOWED_FORMATS.includes(metadata.format.toLowerCase())) {
      throw new Error('Unsupported image format. Allowed: PNG, JPG, JPEG, BMP, WEBP');
    }
    if (
      (metadata.width && metadata.width > MAX_DIMENSION) ||
      (metadata.height && metadata.height > MAX_DIMENSION)
    ) {
      throw new Error(`Image resolution exceeds max allowed ${MAX_DIMENSION}x${MAX_DIMENSION}`);
    }
  } catch (err: any) {
    throw new HttpError(400, err.message || 'Invalid or unsupported image file');
  }

  const originalInfo = await getImageDimensionInfo(originalBuffer);

  // --- call Cutout Pro Photo Enhancer Pro API (multipart/form-data, field name: file) ---
  const form = new FormData();
  form.append('file', originalBuffer, {
    filename: file.originalname || `upload.${metadata.format}`,
    contentType: file.mimetype,
  });

  let response;
  try {
    response = await axios.post(config.cutout_pro_upscale_api_url, form, {
      headers: {
        APIKEY: config.cutout_pro_api_key,
        ...form.getHeaders(),
      },
      timeout: 60000,
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
    });
  } catch (err: any) {
    throw new HttpError(502, err.message || 'Failed to reach Cutout Pro upscale API');
  }

  const result = response.data;

  // Confirmed from docs: success -> { code: 0, data: { imageUrl }, msg, time, requestId }
  // Failure -> { code: <non-zero>, data: null, msg: "<reason>" }
  if (result.code !== 0 || !result.data?.imageUrl) {
    throw new HttpError(502, result?.msg || 'Cutout Pro upscale failed');
  }

  const upscaledUrlFromApi: string = result.data.imageUrl;

  // --- download + save upscaled image ---
  const upscaledBuffer = await downloadImageAsBuffer(upscaledUrlFromApi);
  const upscaledInfo = await getImageDimensionInfo(upscaledBuffer);
  const upscaledImageUrl = await saveUpscaledImage(upscaledBuffer, userId);

  // --- compute increase stats ---
  const widthPercent = originalInfo.widthPx
    ? Number((((upscaledInfo.widthPx - originalInfo.widthPx) / originalInfo.widthPx) * 100).toFixed(2))
    : 0;

  const heightPercent = originalInfo.heightPx
    ? Number((((upscaledInfo.heightPx - originalInfo.heightPx) / originalInfo.heightPx) * 100).toFixed(2))
    : 0;

  const sizeBytesPercent = originalInfo.sizeBytes
    ? Number((((upscaledInfo.sizeBytes - originalInfo.sizeBytes) / originalInfo.sizeBytes) * 100).toFixed(2))
    : 0;

  const sizeMBDiff = Number((upscaledInfo.sizeMB - originalInfo.sizeMB).toFixed(3));

  // --- save to database ---
  const upscale = new Upscale({
    userId: new mongoose.Types.ObjectId(userId),
    originalImage: file.originalname,
    upscaledImageUrl,
    original: originalInfo,
    upscaled: upscaledInfo,
    increase: {
      widthPercent,
      heightPercent,
      sizeBytesPercent,
      sizeMBDiff,
    },
  });

  await upscale.save();

  return upscale;
};

const getAllUpscaledImagesForUser = async (userId: string) => {
  // check if the user exists
  const user = await User.findById(userId);
  if (!user) {
    throw new HttpError(404, 'User not found');
  }

  const upscaledImages = await Upscale.find({ userId }).sort({ createdAt: -1 }).exec();
  // check if the user has any upscaled images
  if (upscaledImages.length === 0) {
    throw new HttpError(404, 'No upscaled images found for this user');
  }
  return upscaledImages;
};

export const UpscaleServices = {
  upscaleImage,
  getAllUpscaledImagesForUser,
};