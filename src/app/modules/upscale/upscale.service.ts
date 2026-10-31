import fs from 'fs';
import sharp from 'sharp';
import axios from 'axios';
import FormData from 'form-data';
import config from '../../config';
import { HttpError } from '../../errors/HttpError';
import { UPSCALE_STATUS } from './upscale.constant';
import {
  downloadImageAsBuffer,
  saveOriginalImage,
  saveUpscaledImage,
  getImageDimensionInfo,
} from './upscale.utils';
import { TUpscale } from './upscale.interface';
import { Upscale } from './upscale.model';

const ALLOWED_FORMATS = ['png', 'jpeg', 'jpg', 'bmp', 'webp'];
const MAX_INPUT_DIMENSION = 4096;
const MAX_FILE_SIZE_MB = 15;
const APPROX_MAX_OUTPUT_MEGAPIXELS = 4.5;

const upscaleImage = async (userId: string, file?: Express.Multer.File): Promise<TUpscale> => {
  if (!file) throw new HttpError(400, 'No file provided');

  if (!config.cutout_pro_upscale_api_url || !config.cutout_pro_api_key) {
    throw new HttpError(500, 'Cutout Pro upscale configuration is missing');
  }

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
      throw new Error('Unsupported image format. Allowed: PNG, JPG, JPEG, BMP, WEBP');
    }
    if (
      (metadata.width && metadata.width > MAX_INPUT_DIMENSION) ||
      (metadata.height && metadata.height > MAX_INPUT_DIMENSION)
    ) {
      throw new Error(
        `Image resolution exceeds max allowed ${MAX_INPUT_DIMENSION}x${MAX_INPUT_DIMENSION}`,
      );
    }
  } catch (err: any) {
    throw new HttpError(400, err.message || 'Invalid or unsupported image file');
  }

  const originalImagePath = await saveOriginalImage(originalBuffer, userId);

  const upscaleDoc = new Upscale({
    userId,
    originalImage: originalImagePath,
    status: UPSCALE_STATUS.PENDING,
  });
  await upscaleDoc.save();

  const originalInfo = await getImageDimensionInfo(originalBuffer);
  const originalMegapixels = (originalInfo.widthPx * originalInfo.heightPx) / 1_000_000;

  let preCheckWarning: string | undefined;
  if (originalMegapixels >= APPROX_MAX_OUTPUT_MEGAPIXELS) {
    preCheckWarning =
      `Original image (${originalInfo.widthPx}x${originalInfo.heightPx}) is already at or above ` +
      `Cutout Pro's max output resolution for this enhancer. The result may come back smaller, not upscaled.`;
  }

  upscaleDoc.status = UPSCALE_STATUS.PROCESSING;
  await upscaleDoc.save();

  try {
    const form = new FormData();
    form.append('file', originalBuffer, {
      filename: file.originalname || `upload.${metadata.format}`,
      contentType: file.mimetype,
    });

    const response = await axios.post(config.cutout_pro_upscale_api_url, form, {
      headers: {
        APIKEY: config.cutout_pro_api_key,
        ...form.getHeaders(),
      },
      timeout: 60000,
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
    });

    const result = response.data;

    if (result.code !== 0 || !result.data?.imageUrl) {
      throw new Error(result?.msg || 'Cutout Pro upscale failed');
    }

    const upscaledBuffer = await downloadImageAsBuffer(result.data.imageUrl);
    const upscaledInfo = await getImageDimensionInfo(upscaledBuffer);
    const upscaledImageUrl = await saveUpscaledImage(upscaledBuffer, userId);

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

    const didUpscale = widthPercent > 0 && heightPercent > 0;

    upscaleDoc.upscaledImage = upscaledImageUrl;
    upscaleDoc.original = originalInfo;
    upscaleDoc.upscaled = upscaledInfo;
    upscaleDoc.increase = { widthPercent, heightPercent, sizeBytesPercent, sizeMBDiff };
    upscaleDoc.didUpscale = didUpscale;
    const warningMessage =
      preCheckWarning ||
      (!didUpscale
        ? "Cutout Pro returned an image smaller than the original — this image was likely already above the enhancer's max output resolution."
        : undefined);
    if (warningMessage) {
      upscaleDoc.warning = warningMessage;
    }
    upscaleDoc.status = UPSCALE_STATUS.SUCCESS;


    await upscaleDoc.save();

    return upscaleDoc;
  } catch (error: any) {
    upscaleDoc.status = UPSCALE_STATUS.FAILED;
    upscaleDoc.errorMessage = error.message;
    await upscaleDoc.save();
    throw new HttpError(502, error.message || 'Cutout Pro upscale failed');
  }
};

const getAllUpscalesForUser = async (userId: string) => {
  const upscales = await Upscale.find({ userId }).sort({ createdAt: -1 }).exec();
  if (upscales.length === 0) {
    throw new HttpError(404, 'No upscaled images found for this user');
  }
  return upscales;
};

export const UpscaleServices = {
  upscaleImage,
  getAllUpscalesForUser,
};
