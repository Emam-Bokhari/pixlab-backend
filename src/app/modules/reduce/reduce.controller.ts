import catchAsync from '../../shared/catchAsync';
import sendResponse from '../../shared/sendResponse';
import { ReduceServices } from './reduce.service';

const reducePhoto = catchAsync(async (req, res) => {
  const userId = (req as any).user?.id;
  const data = req.body;

  const result = await ReduceServices.reduceImageSize(userId, data);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Image size reduced successfully',
    data: result,
  });
});

const getAllReducedImages = catchAsync(async (req, res) => {
  const userId = (req as any).user?.id;
  const result = await ReduceServices.getAllReducedImagesForUser(userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Reduced images retrieved successfully',
    data: result,
  });
});

export const ReduceControllers = {
  reducePhoto,
  getAllReducedImages,
};
