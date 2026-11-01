import { Request, Response } from 'express';
import catchAsync from '../../shared/catchAsync';
import { BgRemoveServices } from './bgRemove.service';
import { HttpError } from '../../errors/HttpError';

const removeBg = catchAsync(async (req: Request, res: Response) => {
  const file = req.file;

  if (!file) {
    throw new HttpError(400, 'No image file provided');
  }

  const bgColor = req.body?.bgColor as string | undefined;

  const result = await BgRemoveServices.removeBg(file, bgColor);

  res.set({
    'Content-Type': 'image/png',
    'Content-Disposition': 'attachment; filename="bg-removed.png"',
    'Content-Length': result.buffer.length.toString(),
    ...(result.bgColor && { 'X-Background-Color': result.bgColor }),
    'Access-Control-Expose-Headers': 'X-Background-Color',
  });

  res.send(result.buffer);
});

export const BgRemoveControllers = {
  removeBg,
};
