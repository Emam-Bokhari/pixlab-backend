import { Request, Response } from 'express';
import catchAsync from '../../shared/catchAsync';
import { BgRemoveServices } from './bgRemove.service';
import sendResponse from '../../shared/sendResponse';
import { isBinaryRequested, sendBinaryResponse } from '../../shared/sendBinaryResponse';

const removeBg = catchAsync(async (req: Request, res: Response) => {
  const result = await BgRemoveServices.removeBg(req.file, req.body?.bgColor);

  if (isBinaryRequested(req)) {
    return sendBinaryResponse(res, result.binary);
  }

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Background removed successfully',
    data: result.data,
  });
});

export const BgRemoveControllers = {
  removeBg,
};
