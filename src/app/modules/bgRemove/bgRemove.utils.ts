import sharp from 'sharp';
import { HttpError } from '../../errors/HttpError';
import { ImageDetailsWithData } from './bgRemove.interface';

export const ALLOWED_FORMATS = [
  'png',
  'jpeg',
  'jpg',
  'webp',
  'bmp',
  'tiff',
  'gif',
  'avif',
];

export interface ParsedHexColor {
  cleanHex: string;
  rgb: { r: number; g: number; b: number };
}

export const parseHexColor = (rawColor?: string): ParsedHexColor | undefined => {
  if (!rawColor || typeof rawColor !== 'string') {
    return undefined;
  }

  const trimmed = rawColor.trim().replace(/^#/, '');
  if (!trimmed) {
    return undefined;
  }

  if (!/^[0-9a-fA-F]{3}$|^[0-9a-fA-F]{6}$/.test(trimmed)) {
    throw new HttpError(400, 'Invalid background color hex format. Expected format: #FFFFFF or #FFF');
  }

  const fullHex =
    trimmed.length === 3
      ? trimmed
          .split('')
          .map((c) => c + c)
          .join('')
      : trimmed;

  const r = parseInt(fullHex.substring(0, 2), 16);
  const g = parseInt(fullHex.substring(2, 4), 16);
  const b = parseInt(fullHex.substring(4, 6), 16);

  return {
    cleanHex: fullHex.toUpperCase(),
    rgb: { r, g, b },
  };
};

export const getImageDetails = async (
  buffer: Buffer,
  fallbackMime?: string,
): Promise<ImageDetailsWithData> => {
  const metadata = await sharp(buffer).metadata();
  const sizeBytes = buffer.length;

  const format =
    (metadata.format as string) || (fallbackMime ? fallbackMime.split('/')[1] : 'png') || 'png';

  const mime =
    format === 'jpeg' || format === 'jpg'
      ? 'image/jpeg'
      : format === 'webp'
        ? 'image/webp'
        : format === 'png'
          ? 'image/png'
          : fallbackMime || `image/${format}`;

  const base64 = `data:${mime};base64,${buffer.toString('base64')}`;

  return {
    format,
    widthPx: metadata.width || 0,
    heightPx: metadata.height || 0,
    sizeBytes,
    sizeKB: Number((sizeBytes / 1024).toFixed(2)),
    sizeMB: Number((sizeBytes / (1024 * 1024)).toFixed(2)),
    imageUrl: base64,
  };
};

