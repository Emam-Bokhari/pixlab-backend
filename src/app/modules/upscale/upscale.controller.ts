import catchAsync from '../../shared/catchAsync';
import sendResponse from '../../shared/sendResponse';
import { UpscaleServices } from './upscale.service';

const upscalePhoto = catchAsync(async (req, res) => {
  const { id: userId } = req.user as { id: string };
  const files = (req.files || {}) as any;
  const file = files?.image?.[0];

  const result = await UpscaleServices.upscaleImage(userId, file);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Image upscaled successfully',
    data: result,
  });
});

const getAllUpscales = catchAsync(async (req, res) => {
  const { id: userId } = req.user as { id: string };

  const result = await UpscaleServices.getAllUpscalesForUser(userId);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Upscaled images retrieved successfully',
    data: result,
  });
});

export const UpscaleControllers = {
  upscalePhoto,
  getAllUpscales,
};
