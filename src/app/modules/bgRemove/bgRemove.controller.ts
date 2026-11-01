import { Request, Response } from 'express';
import sharp from 'sharp';
import catchAsync from '../../shared/catchAsync';
import { BgRemoveServices } from './bgRemove.service';
import { HttpError } from '../../errors/HttpError';
import sendResponse from '../../shared/sendResponse';
import { BgRemoveResponseData, ImageDetailsWithData } from './bgRemove.interface';

const removeBg = catchAsync(async (req: Request, res: Response) => {
  const file = req.file;

  if (!file) {
    throw new HttpError(400, 'No image file provided');
  }

  const bgColor = req.body?.bgColor as string | undefined;

  const result = await BgRemoveServices.removeBg(file, bgColor);

  if (req.query?.type === 'binary' || req.query?.download === 'true') {
    res.set({
      'Content-Type': 'image/png',
      'Content-Disposition': 'attachment; filename="bg-removed.png"',
      'Content-Length': result.buffer.length.toString(),
      ...(result.bgColor && { 'X-Background-Color': result.bgColor }),
      'Access-Control-Expose-Headers': 'X-Background-Color',
    });

    return res.send(result.buffer);
  }

  const origMeta = await sharp(file.buffer).metadata();
  const origBytes = file.buffer.length;
  const origFormat: string =
    (origMeta.format as string) || (file.mimetype ? file.mimetype.split('/')[1] : 'jpeg') || 'jpeg';
  const originalMime = file.mimetype || `image/${origFormat}`;
  const originalBase64 = `data:${originalMime};base64,${file.buffer.toString('base64')}`;

  const currMeta = await sharp(result.buffer).metadata();
  const currBytes = result.buffer.length;
  const currentMime = 'image/png';
  const currentBase64 = `data:${currentMime};base64,${result.buffer.toString('base64')}`;

  const originalInfo: ImageDetailsWithData = {
    format: origFormat,
    widthPx: origMeta.width || 0,
    heightPx: origMeta.height || 0,
    sizeBytes: origBytes,
    sizeKB: Number((origBytes / 1024).toFixed(2)),
    sizeMB: Number((origBytes / (1024 * 1024)).toFixed(2)),
    imageUrl: originalBase64,
  };

  const currentInfo: ImageDetailsWithData = {
    format: 'png',
    widthPx: currMeta.width || 0,
    heightPx: currMeta.height || 0,
    sizeBytes: currBytes,
    sizeKB: Number((currBytes / 1024).toFixed(2)),
    sizeMB: Number((currBytes / (1024 * 1024)).toFixed(2)),
    imageUrl: currentBase64,
  };

  const responseData: BgRemoveResponseData = {
    original: originalInfo,
    current: currentInfo,
    ...(result.bgColor && { bgColor: result.bgColor }),
  };

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Background removed successfully',
    data: responseData,
  });
});

export const BgRemoveControllers = {
  removeBg,
};
