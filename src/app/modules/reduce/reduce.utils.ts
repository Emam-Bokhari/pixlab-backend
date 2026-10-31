import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { ImageSizeInfo } from './reduce.interface';
import { generateReducedPhotoId } from '../../utils/generateYearBasedId';

const BASE_UPLOAD_DIR = path.join(process.cwd(), 'uploads');

export interface CompressedImageResult {
  buffer: Buffer;
  widthPx: number;
  heightPx: number;
  format: string;
  sizeBytes: number;
}

export const compressImageToTargetSize = async (
  inputBuffer: Buffer,
  targetSizeKb: number,
  originalFormat: string,
): Promise<CompressedImageResult> => {
  const targetSizeBytes = targetSizeKb * 1024;

  const image = sharp(inputBuffer);
  const metadata = await image.metadata();
  const originalWidth = metadata.width || 800;
  const originalHeight = metadata.height || 600;

  let format = originalFormat.toLowerCase();
  if (format === 'bmp' || format === 'png') {
    // BMP and PNG are lossless/uncompressed. For lossy size reduction,
    // we convert them to jpeg to retain size and quality.
    format = 'jpeg';
  } else if (format === 'jpg') {
    format = 'jpeg';
  }

  // Iterative scaling search
  const scaleFactors = [1.0, 0.85, 0.7, 0.5, 0.35, 0.2, 0.1];
  const minQuality = 20;
  const maxQuality = 90;

  for (const scale of scaleFactors) {
    const w = Math.round(originalWidth * scale);
    const h = Math.round(originalHeight * scale);

    let lowQ = minQuality;
    let highQ = maxQuality;
    let scaleBestBuffer: Buffer | null = null;
    let scaleBestSize = 0;

    // Binary search for quality
    for (let iter = 0; iter < 4; iter++) {
      const q = Math.round((lowQ + highQ) / 2);

      let proc = sharp(inputBuffer).resize(w, h);
      if (format === 'jpeg') {
        proc = proc.jpeg({ quality: q, chromaSubsampling: '4:2:0' });
      } else if (format === 'webp') {
        proc = proc.webp({ quality: q });
      } else {
        proc = proc.png({ compressionLevel: 9 });
      }

      const buf = await proc.toBuffer();
      const size = buf.length;

      if (size <= targetSizeBytes) {
        scaleBestBuffer = buf;
        scaleBestSize = size;
        lowQ = q + 1; // Try to get higher quality
      } else {
        highQ = q - 1; // Too large, decrease quality
      }
    }

    if (scaleBestBuffer) {
      return {
        buffer: scaleBestBuffer,
        widthPx: w,
        heightPx: h,
        format,
        sizeBytes: scaleBestBuffer.length,
      };
    }
  }

  // Fallback to absolute minimum scale and quality
  const minScale = 0.1;
  const w = Math.round(originalWidth * minScale);
  const h = Math.round(originalHeight * minScale);

  let proc = sharp(inputBuffer).resize(w, h);
  if (format === 'jpeg') {
    proc = proc.jpeg({ quality: minQuality });
  } else if (format === 'webp') {
    proc = proc.webp({ quality: minQuality });
  } else {
    proc = proc.png({ compressionLevel: 9 });
  }

  const finalBuffer = await proc.toBuffer();
  return {
    buffer: finalBuffer,
    widthPx: w,
    heightPx: h,
    format,
    sizeBytes: finalBuffer.length,
  };
};

export const saveReducedImage = async (
  buffer: Buffer,
  userId: string,
  format: string,
): Promise<string> => {
  const folderName = 'reduce';
  const dir = path.join(BASE_UPLOAD_DIR, folderName);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const ext = format === 'jpeg' ? 'jpg' : format;
  // const fileName = `${userId}-reduce-${Date.now()}.${ext}`;
  const reducedPhotoId = await generateReducedPhotoId();
  const fileName = `${reducedPhotoId}.${ext}`;
  const filePath = path.join(dir, fileName);
  fs.writeFileSync(filePath, buffer);

  return `/uploads/${folderName}/${fileName}`;
};

export const getImageSizeInfo = async (buffer: Buffer): Promise<ImageSizeInfo> => {
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
