import { removeBackground as imglyRemoveBg } from '@imgly/background-removal-node';
import sharp from 'sharp';

export const removeBackground = async (
  imageBuffer: Buffer,
  bgColorHex?: string,
): Promise<Buffer> => {
  // Normalize input image (JPG, JPEG, WEBP, PNG, etc.) to a 4-channel RGBA PNG
  // and auto-rotate according to EXIF metadata
  const normalizedPngBuffer = await sharp(imageBuffer).rotate().ensureAlpha().png().toBuffer();

  // Create a Blob with explicit image/png mime type for @imgly
  const inputBlob = new Blob([new Uint8Array(normalizedPngBuffer)], { type: 'image/png' });

  const resultBlob = await imglyRemoveBg(inputBlob, {
    model: 'medium', // "small" | "medium" | "large"
    output: {
      format: 'image/png',
      quality: 1,
    },
  });

  const resultArrayBuffer = await resultBlob.arrayBuffer();
  const transparentBuffer = Buffer.from(resultArrayBuffer);

  if (!bgColorHex || bgColorHex.trim().length === 0) {
    return transparentBuffer;
  }

  let fullHex = bgColorHex.replace(/^#/, '').trim();
  if (fullHex.length === 3) {
    fullHex = fullHex
      .split('')
      .map((char) => char + char)
      .join('');
  }

  const r = parseInt(fullHex.substring(0, 2), 16) || 0;
  const g = parseInt(fullHex.substring(2, 4), 16) || 0;
  const b = parseInt(fullHex.substring(4, 6), 16) || 0;

  const metadata = await sharp(transparentBuffer).metadata();
  const width = metadata.width ?? 800;
  const height = metadata.height ?? 600;

  // composite transparent png over solid color background
  const coloredBuffer = await sharp({
    create: {
      width,
      height,
      channels: 4,
      background: { r, g, b, alpha: 1 },
    },
  })
    .png()
    .composite([{ input: transparentBuffer, blend: 'over' }])
    .png()
    .toBuffer();

  return coloredBuffer;
};
