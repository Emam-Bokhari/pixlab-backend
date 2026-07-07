import axios from 'axios';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { DPI } from './layouts/layouts.constant';

export const bufferToBase64 = (buffer: Buffer): string => buffer.toString('base64');

const BASE_UPLOAD_DIR = path.join(process.cwd(), 'uploads');

export const downloadImageAsBuffer = async (url: string): Promise<Buffer> => {
  const res = await axios.get(url, { responseType: 'arraybuffer' });
  return Buffer.from(res.data);
};

/**
 * Persists a buffer to disk in the requested format, embedding 300 DPI
 * metadata on every variant so downstream printing tools read the
 * correct physical size.
 *
 * NOTE: layout/grid math no longer lives here — see layouts/render-layout.ts.
 * This function only ever converts format + saves.
 */
export const downloadAndSaveProcessedImage = async (
  buffer: Buffer,
  userId: string,
  photoType: string,
  variant: 'png' | 'jpg' | 'webp' | 'layout',
  dpi: number = DPI,
): Promise<string> => {
  let sharpInstance = sharp(buffer).withMetadata({ density: dpi });

  if (variant === 'jpg') {
    sharpInstance = sharpInstance.jpeg({ quality: 95 });
  } else if (variant === 'webp') {
    sharpInstance = sharpInstance.webp({ quality: 90 });
  } else {
    sharpInstance = sharpInstance.png({ quality: 100 });
  }

  const finalBuffer = await sharpInstance.toBuffer();

  const folderName = 'processedImage';
  const dir = path.join(BASE_UPLOAD_DIR, folderName);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const ext = variant === 'jpg' ? 'jpg' : variant === 'webp' ? 'webp' : 'png';
  const fileName = `${userId}-${photoType}-${variant}-${Date.now()}.${ext}`;
  const filePath = path.join(dir, fileName);
  fs.writeFileSync(filePath, finalBuffer);

  return `/uploads/${folderName}/${fileName}`;
};

/**
 * Reads back a previously-saved output file (by its stored public URL,
 * e.g. photo.printLayoutImage) as a Buffer. Used by the lazy print-layout /
 * converter / pdf endpoints so they can reuse an already-rendered layout
 * instead of re-compositing it from scratch every time.
 */
export const readSavedFileBuffer = (publicUrl: string): Buffer => {
  const fullPath = path.join(process.cwd(), publicUrl.replace(/^\//, ''));
  if (!fs.existsSync(fullPath)) {
    throw new Error(`Saved file not found on disk: ${publicUrl}`);
  }
  return fs.readFileSync(fullPath);
};

/**
 * Saves a PDF buffer using the same folder/URL convention as
 * downloadAndSaveProcessedImage, so the returned link works exactly
 * like the existing png/jpg/webp links — visiting it opens the PDF.
 */
export const downloadAndSavePdf = async (
  buffer: Buffer,
  userId: string,
  photoType: string,
): Promise<string> => {
  const folderName = 'processedImage';
  const dir = path.join(BASE_UPLOAD_DIR, folderName);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const fileName = `${userId}-${photoType}-layout-${Date.now()}.pdf`;
  const filePath = path.join(dir, fileName);

  fs.writeFileSync(filePath, buffer);

  return `/uploads/${folderName}/${fileName}`;
};
