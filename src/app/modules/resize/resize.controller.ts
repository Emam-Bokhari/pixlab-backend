import catchAsync from '../../shared/catchAsync';
import sendResponse from '../../shared/sendResponse';
import { ResizeServices } from './resize.service';

const resizePhoto = catchAsync(async (req, res) => {
  const userId = (req as any).user?.id;
  const files = (req.files || {}) as any;
  const file = files?.image?.[0];

  const { width, height } = req.body;

  const result = await ResizeServices.resizeImage(
    userId,
    {
      width: Number(width),
      height: Number(height),
    },
    file,
  );

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Image resized successfully',
    data: result,
  });
});

const getAllResizes = catchAsync(async (req, res) => {
  const userId = (req as any).user?.id;

  const result = await ResizeServices.getAllResizesForUser(userId);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Resized images retrieved successfully',
    data: result,
  });
});

export const ResizeControllers = {
  resizePhoto,
  getAllResizes,
};
