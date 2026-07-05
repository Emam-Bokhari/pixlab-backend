// import axios from 'axios';
// import sharp from 'sharp';
// import fs from 'fs';
// import path from 'path';


// export const bufferToBase64 = (buffer: Buffer): string => {
//   const base64 = buffer.toString('base64');
//   return base64;
// };


// const BASE_UPLOAD_DIR = path.join(process.cwd(), 'uploads');

// // 1. Download as Buffer
// export const downloadImageAsBuffer = async (url: string): Promise<Buffer> => {
//   const res = await axios.get(url, { responseType: 'arraybuffer' });
//   return Buffer.from(res.data);
// };

// // 2. Save Buffer with format
// export const downloadAndSaveProcessedImage = async (
//   buffer: Buffer,
//   userId: string,
//   photoType: string,
//   variant: 'png' | 'jpg' | 'webp' | 'layout'
// ): Promise<string> => {
//   let sharpInstance = sharp(buffer);

//   if (variant === 'jpg') {
//     sharpInstance = sharpInstance.jpeg({ quality: 95 });
//   } else if (variant === 'webp') {
//     sharpInstance = sharpInstance.webp({ quality: 90 });
//   } else {
//     sharpInstance = sharpInstance.png({ quality: 100 });
//   }

//   const finalBuffer = await sharpInstance.toBuffer();

//   const folderName = 'processedImage';
//   const dir = path.join(BASE_UPLOAD_DIR, folderName);
//   if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

//   const ext = variant === 'jpg' ? 'jpg' : variant === 'webp' ? 'webp' : 'png';
//   const fileName = `${userId}-${photoType}-${variant}-${Date.now()}.${ext}`;
//   const filePath = path.join(dir, fileName);

//   fs.writeFileSync(filePath, finalBuffer);

//   return `/uploads/${folderName}/${fileName}`;
// };

// // 3. Create Print Layout (Multiple Copies)
// // utils/printUtils.ts
// export const createPrintLayout = async (
//   singleBuffer: Buffer,
//   sizeInfo: { mmWidth: number; mmHeight: number },
//   copies: number,
//   paperType: '4R' | '5R' | '6R' | 'A4' = '4R'   // Default 4R (সবচেয়ে কমন)
// ): Promise<Buffer> => {
//   const dpi = 300;
//   const mmToPx = (mm: number) => Math.round((mm * dpi) / 25.4);

//   const photoW = mmToPx(sizeInfo.mmWidth);
//   const photoH = mmToPx(sizeInfo.mmHeight);
//   const marginMm = 4;
//   const gapMm = 3;

//   let paperWidthMm: number, paperHeightMm: number;

//   // Studio Print Sizes
//   switch (paperType) {
//     case '4R': // 6x4 inch - সবচেয়ে কমন
//       paperWidthMm = 152;
//       paperHeightMm = 102;
//       break;
//     case '5R': // 7x5 inch
//       paperWidthMm = 178;
//       paperHeightMm = 127;
//       break;
//     case '6R': // 8x6 inch
//       paperWidthMm = 203;
//       paperHeightMm = 152;
//       break;
//     case 'A4':
//       paperWidthMm = 210;
//       paperHeightMm = 297;
//       break;
//     default:
//       paperWidthMm = 152;
//       paperHeightMm = 102;
//   }

//   const paperW = mmToPx(paperWidthMm);
//   const paperH = mmToPx(paperHeightMm);

//   const marginPx = mmToPx(marginMm);
//   const gapPx = mmToPx(gapMm);

//   // Dynamic Grid
//   const maxCols = Math.floor((paperW - marginPx * 2) / (photoW + gapPx));
//   const cols = Math.min(maxCols, copies);
//   const rows = Math.ceil(copies / cols);

//   const composites: any[] = [];
//   let count = 0;

//   for (let r = 0; r < rows; r++) {
//     for (let c = 0; c < cols; c++) {
//       if (count >= copies) break;

//       const x = marginPx + c * (photoW + gapPx);
//       const y = marginPx + r * (photoH + gapPx);

//       composites.push({
//         input: singleBuffer,
//         left: x,
//         top: y,
//       });
//       count++;
//     }
//   }

//   return sharp({
//     create: {
//       width: paperW,
//       height: paperH,
//       channels: 4,
//       background: { r: 255, g: 255, b: 255, alpha: 1 },
//     },
//   })
//     .composite(composites)
//     .png({ quality: 100 })
//     .toBuffer();
// };

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
  dpi: number = DPI
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