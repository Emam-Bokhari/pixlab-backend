import { removeBackground as imglyRemoveBg } from '@imgly/background-removal-node';
import sharp from 'sharp';

interface RgbColor {
  r: number;
  g: number;
  b: number;
}

export const removeBackground = async (
  imageBuffer: Buffer,
  bgColorRgb?: RgbColor,
): Promise<Buffer> => {
  const normalizedPng = await sharp(imageBuffer).rotate().ensureAlpha().png().toBuffer();

  const inputBlob = new Blob([new Uint8Array(normalizedPng)], { type: 'image/png' });

  const resultBlob = await imglyRemoveBg(inputBlob, {
    model: 'medium',
    output: {
      format: 'image/png',
      quality: 1,
    },
  });

  const resultArrayBuffer = await resultBlob.arrayBuffer();
  const transparentBuffer = Buffer.from(resultArrayBuffer);

  if (!bgColorRgb) {
    return transparentBuffer;
  }

  const metadata = await sharp(transparentBuffer).metadata();
  const width = metadata.width ?? 800;
  const height = metadata.height ?? 600;

  return sharp({
    create: {
      width,
      height,
      channels: 4,
      background: {
        r: bgColorRgb.r,
        g: bgColorRgb.g,
        b: bgColorRgb.b,
        alpha: 1,
      },
    },
  })
    .png()
    .composite([{ input: transparentBuffer, blend: 'over' }])
    .png()
    .toBuffer();
};
