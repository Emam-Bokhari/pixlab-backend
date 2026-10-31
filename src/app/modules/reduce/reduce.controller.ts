import catchAsync from '../../shared/catchAsync';
import sendResponse from '../../shared/sendResponse';
import { ReduceServices } from './reduce.service';

const reducePhoto = catchAsync(async (req, res) => {
  const data = req.body;

  const result = await ReduceServices.reduceImageSize(data);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Image size reduced successfully',
    data: result,
  });
});

const getAllReducedImages = catchAsync(async (req, res) => {
  const result = await ReduceServices.getAllReducedImages();

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
