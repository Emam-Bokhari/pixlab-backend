import catchAsync from '../../shared/catchAsync';
import sendResponse from '../../shared/sendResponse';
import { PhotoServices } from './photo.service';
import { IFolderName } from '../../middlewares/fileUploadHandler';

type MulterFiles = {
  [key in IFolderName]?: Express.Multer.File[];
};

const createPhoto = catchAsync(async (req, res) => {
  const { id: userId } = req.user as { id: string };
  const data = req.body;
  const files = (req.files || {}) as MulterFiles;
  const originalImageFile = files?.originalImage?.[0];
  const result = await PhotoServices.createPhotoToDB(data, userId, originalImageFile);
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
