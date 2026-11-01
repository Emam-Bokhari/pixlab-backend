import sharp from 'sharp';
import { ImageDimensionInfo } from './upscale.interface';

export const getImageDimensionInfo = async (buffer: Buffer): Promise<ImageDimensionInfo> => {
  const metadata = await sharp(buffer).metadata();
  const sizeBytes = buffer.length;

  return {
    widthPx: metadata.width || 0,
    heightPx: metadata.height || 0,
    sizeBytes,
    sizeKB: Number((sizeBytes / 1024).toFixed(2)),
    sizeMB: Number((sizeBytes / (1024 * 1024)).toFixed(3)),
  };
};
