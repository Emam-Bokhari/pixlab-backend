import { Request, Response } from 'express';
import catchAsync from '../../shared/catchAsync';
import { FcmTokenServices } from './fcmToken.service';
import sendResponse from '../../shared/sendResponse';

const createDeviceToken = catchAsync(async (req: Request, res: Response) => {
  const { id: userId } = req.user as { id: string };
  const result = await FcmTokenServices.createDeviceTokenToDB(userId, req.body);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Device token saved successfully',
    data: result,
  });
});

export const FcmTokenControllers = {
  createDeviceToken,
};
