import sharp from 'sharp';
import { HttpError } from '../../errors/HttpError';
import { removeBackground } from './bgRemove.client';
import { BgRemoveResult } from './bgRemove.interface';
import { ALLOWED_FORMATS, getImageDetails, parseHexColor } from './bgRemove.utils';

const removeBg = async (file?: Express.Multer.File, bgColor?: string): Promise<BgRemoveResult> => {
  if (!file || !file.buffer) {
    throw new HttpError(400, 'No image file provided');
  }

  try {
    const metadata = await sharp(file.buffer).metadata();
    if (!metadata.format || !ALLOWED_FORMATS.includes(metadata.format.toLowerCase())) {
      throw new Error(`Unsupported image format. Allowed: ${ALLOWED_FORMATS.join(', ')}`);
    }
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Invalid or unsupported image file';
    throw new HttpError(400, errorMessage);
  }

  const parsedColor = parseHexColor(bgColor);
  const processedBuffer = await removeBackground(file.buffer, parsedColor?.rgb);

  const [originalInfo, currentInfo] = await Promise.all([
    getImageDetails(file.buffer, file.mimetype),
    getImageDetails(processedBuffer, 'image/png'),
  ]);

  return {
    binary: {
      buffer: processedBuffer,
      filename: 'bg-removed.png',
      contentType: 'image/png',
      original: originalInfo,
      processed: currentInfo,
      processedPrefix: 'Current',
      extraHeaders: parsedColor ? { 'X-Background-Color': parsedColor.cleanHex } : undefined,
    },
    data: {
      original: originalInfo,
      current: currentInfo,
      ...(parsedColor && { bgColor: parsedColor.cleanHex }),
    },
  };
};

export const BgRemoveServices = {
  removeBg,
};
