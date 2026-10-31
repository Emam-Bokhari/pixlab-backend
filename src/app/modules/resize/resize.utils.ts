import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { ImageDimensionInfo } from './resize.interface';
import { generateResizedPhotoId } from '../../utils/generateYearBasedId';

const BASE_UPLOAD_DIR = path.join(process.cwd(), 'uploads');

export const getImageDimensionInfo = async (buffer: Buffer): Promise<ImageDimensionInfo> => {
  const metadata = await sharp(buffer).metadata();
  const sizeBytes = buffer.length;

  return {
    widthPx: metadata.width || 0,
    heightPx: metadata.height || 0,
    sizeBytes,
    sizeKB: Number((sizeBytes / 1024).toFixed(2)),
    sizeMB: Number((sizeBytes / (1024 * 1024)).toFixed(3)),
    format: metadata.format || 'unknown',
  };
};

export const saveOriginalImage = async (buffer: Buffer, userId: string): Promise<string> => {
  const folderName = 'resize-original';
  const dir = path.join(BASE_UPLOAD_DIR, folderName);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const metadata = await sharp(buffer).metadata();
  const ext = metadata.format || 'png';
  // const fileName = `${userId}-original-${Date.now()}.${ext}`;
  const resizedPhotoId = await generateResizedPhotoId();
  const fileName = `${resizedPhotoId}.${ext}`;
  const filePath = path.join(dir, fileName);
  fs.writeFileSync(filePath, buffer);

  return `/uploads/${folderName}/${fileName}`;
};

export const saveResizedImage = async (
  buffer: Buffer,
  userId: string,
  format: string,
): Promise<string> => {
  const folderName = 'resize';
  const dir = path.join(BASE_UPLOAD_DIR, folderName);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  // const fileName = `${userId}-resized-${Date.now()}.${format}`;
  const resizedPhotoId = await generateResizedPhotoId();
  const fileName = `${resizedPhotoId}.${format}`;
  const filePath = path.join(dir, fileName);
  fs.writeFileSync(filePath, buffer);

  return `/uploads/${folderName}/${fileName}`;
};
