import catchAsync from '../../shared/catchAsync';
import { UpscaleServices } from './upscale.service';
import sendResponse from '../../shared/sendResponse';
import { isBinaryRequested, sendBinaryResponse } from '../../shared/sendBinaryResponse';

const upscalePhoto = catchAsync(async (req, res) => {
  const result = await UpscaleServices.upscaleImage(req.file, req.body?.scale);

  if (isBinaryRequested(req)) {
    return sendBinaryResponse(res, result.binary);
  }

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Image upscaled successfully',
    data: result.data,
  });
});

export const UpscaleControllers = {
  upscalePhoto,
};
