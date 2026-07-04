import catchAsync from '../../shared/catchAsync';
import sendResponse from '../../shared/sendResponse';
import { PhotoServices } from './photo.service';

const createPhoto = catchAsync(async (req, res) => {
  const { id: userId } = req.user as { id: string };
  const data = req.body;
  const result = await PhotoServices.createPhotoToDB(data, userId);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Photo created successfully',
    data: result,
  });
});

export const PhotoControllers = {
  createPhoto,
};
