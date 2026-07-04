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

const regeneratePrintLayout = catchAsync(async (req, res) => {
  const { id: photoId } = req.params as { id: string };
  const { newCopies, paperSize } = req.body;
  const parsedCopies = Number(newCopies);
  const result = await PhotoServices.regeneratePrintLayoutLocal(photoId, parsedCopies, paperSize);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Print layout regenerated successfully',
    data: result,
  });
});

export const PhotoControllers = {
  createPhoto,
  regeneratePrintLayout,
};
