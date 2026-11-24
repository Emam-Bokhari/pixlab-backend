import { removeBackground as imglyRemoveBg } from '@imgly/background-removal-node';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import config from '../../config';

interface RgbColor {
  r: number;
  g: number;
  b: number;
}

const isServerless =
  Boolean(process.env.VERCEL) ||
  Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME) ||
  Boolean(process.env.LAMBDA_TASK_ROOT);

const OFFICIAL_DATA_CDN = 'https://staticimgly.com/@imgly/background-removal-data/1.4.5/dist/';

const getPublicPath = (): string | undefined => {
  if (config.imgly_public_path) {
    const customPath = config.imgly_public_path.trim();
    return customPath.endsWith('/') ? customPath : `${customPath}/`;
  }

  // On Vercel and serverless platforms, non-code files (like resources.json and onnx chunks)
  // are omitted during bundling, throwing ENOENT if accessing local file paths.
  // Using the official static CDN provides these assets seamlessly.
  if (isServerless) {
    return OFFICIAL_DATA_CDN;
  }

  // If running locally and local dist/resources.json exists, return undefined to use local files.
  const localDistPath = path.resolve(
    process.cwd(),
    'node_modules/@imgly/background-removal-node/dist',
  );
  if (fs.existsSync(path.join(localDistPath, 'resources.json'))) {
    return undefined;
  }

  return OFFICIAL_DATA_CDN;
};

export const removeBackground = async (
  imageBuffer: Buffer,
  bgColorRgb?: RgbColor,
): Promise<Buffer> => {
  const normalizedPng = await sharp(imageBuffer).rotate().ensureAlpha().png().toBuffer();

  const inputBlob = new Blob([new Uint8Array(normalizedPng)], { type: 'image/png' });

  const publicPath = getPublicPath();
  const model = (config.imgly_model as 'small' | 'medium') || 'medium';

  const resultBlob = await imglyRemoveBg(inputBlob, {
    ...(publicPath ? { publicPath } : {}),
    model,
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
