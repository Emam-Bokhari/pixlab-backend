import { BgRemoveResult } from './bgRemove.interface';
import { removeBackground } from './bgRemove.client';
import { HttpError } from '../../errors/HttpError';

const removeBg = async (
  file: Express.Multer.File,
  bgColor?: string,
): Promise<BgRemoveResult> => {
  if (!file || !file.buffer) {
    throw new HttpError(400, 'No image file provided');
  }

  const originalBuffer = file.buffer;

  const cleanBgColor =
    typeof bgColor === 'string' && bgColor.trim().length > 0
      ? bgColor.trim().replace(/^#/, '').toUpperCase()
      : undefined;

  const processedBuffer = await removeBackground(originalBuffer, cleanBgColor);

  return {
    buffer: processedBuffer,
    bgColor: cleanBgColor,
  };
};

export const BgRemoveServices = {
  removeBg,
};
