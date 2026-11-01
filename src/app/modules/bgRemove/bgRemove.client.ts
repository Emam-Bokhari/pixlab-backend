import { removeBackground as imglyRemoveBg } from '@imgly/background-removal-node';
import sharp from 'sharp';

export const removeBackground = async (
  imageBuffer: Buffer,
  bgColorHex?: string,
): Promise<Buffer> => {
  // accepts ArrayBuffer / Blob / URL
  const arrayBuffer = imageBuffer.buffer.slice(
    imageBuffer.byteOffset,
    imageBuffer.byteOffset + imageBuffer.byteLength,
  ) as ArrayBuffer;

  const resultBlob = await imglyRemoveBg(arrayBuffer, {
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

  const hex = bgColorHex.replace(/^#/, '').toUpperCase();
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  const metadata = await sharp(transparentBuffer).metadata();
  const width = metadata.width ?? 800;
  const height = metadata.height ?? 600;

  // composite transparent png over solid color background
  const coloredBuffer = await sharp({
    create: {
      width,
      height,
      channels: 3,
      background: { r, g, b },
    },
  })
    .png()
    .composite([{ input: transparentBuffer, blend: 'over' }])
    .png()
    .toBuffer();

  return coloredBuffer;
};
