import { Request, Response } from 'express';

import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../shared/catchAsync';
import { FcmTokenServices } from './fcmToken.service';
import sendResponse from '../../shared/sendResponse';

const createDeviceToken = catchAsync(async (req: Request, res: Response) => {
  const { id: userId } = req.user as { id: string };
  const result = await FcmTokenServices.createDeviceTokenToDB(userId, req.body);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Device token saved successfully',
    data: result,
  });
});

export const FcmTokenControllers = {
  createDeviceToken,
};
