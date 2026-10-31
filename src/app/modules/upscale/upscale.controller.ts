import catchAsync from '../../shared/catchAsync';
import sendResponse from '../../shared/sendResponse';
import { UpscaleServices } from './upscale.service';

const upscalePhoto = catchAsync(async (req, res) => {
  const files = (req.files || {}) as any;
  const file = files?.image?.[0];
  const scale = req.body?.scale ? Number(req.body.scale) : 2;

  const result = await UpscaleServices.upscaleImage(file, scale);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Image upscaled successfully',
    data: result,
  });
});

const getAllUpscales = catchAsync(async (req, res) => {
  const result = await UpscaleServices.getAllUpscales();

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
