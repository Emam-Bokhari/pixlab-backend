import axios from 'axios';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { ImageDimensionInfo } from './upscale.interface';

const BASE_UPLOAD_DIR = path.join(process.cwd(), 'uploads');

export const downloadImageAsBuffer = async (url: string): Promise<Buffer> => {
  const res = await axios.get(url, { responseType: 'arraybuffer' });
  return Buffer.from(res.data);
};

export const saveOriginalImage = async (buffer: Buffer, userId: string): Promise<string> => {
  const folderName = 'upscaleOriginal';
  const dir = path.join(BASE_UPLOAD_DIR, folderName);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const metadata = await sharp(buffer).metadata();
  const ext = metadata.format || 'png';
  const fileName = `${userId}-original-${Date.now()}.${ext}`;
  const filePath = path.join(dir, fileName);
  fs.writeFileSync(filePath, buffer);

  return `/uploads/${folderName}/${fileName}`;
};

export const saveUpscaledImage = async (buffer: Buffer, userId: string): Promise<string> => {
  const folderName = 'upscaledImage';
  const dir = path.join(BASE_UPLOAD_DIR, folderName);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const metadata = await sharp(buffer).metadata();
  const ext = metadata.format || 'png';
  const fileName = `${userId}-upscale-${Date.now()}.${ext}`;
  const filePath = path.join(dir, fileName);
  fs.writeFileSync(filePath, buffer);

  return `/uploads/${folderName}/${fileName}`;
};

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
