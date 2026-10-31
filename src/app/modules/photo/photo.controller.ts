import catchAsync from '../../shared/catchAsync';
import sendResponse from '../../shared/sendResponse';
import { PhotoServices } from './photo.service';

const createPhoto = catchAsync(async (req, res) => {
  const userId = (req as any).user?.id;
  const data = req.body;
  const files = (req.files || {}) as any;
  const originalImageFile = files?.originalImage?.[0];
  const result = await PhotoServices.createPhotoToDB(data, userId, originalImageFile);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Photo created successfully',
    data: result,
  });
});

const generatePrintLayout = catchAsync(async (req, res) => {
  const { photoId } = req.params as { photoId: string };
  const { copies, paperSize } = req.body;

  const result = await PhotoServices.generatePrintLayout(photoId, { copies, paperSize });

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Print layout generated successfully',
    data: result,
  });
});

const convertPrintLayout = catchAsync(async (req, res) => {
  const { photoId } = req.params as { photoId: string };

  const result = await PhotoServices.convertPrintLayout(photoId);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Layout converted to png/jpg/webp successfully',
    data: result,
  });
});

const generatePdf = catchAsync(async (req, res) => {
  const { photoId } = req.params as { photoId: string };
  const { copies, paperSize } = req.body;

  const pdfUrl = await PhotoServices.generatePdf(photoId, { copies, paperSize });

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'PDF generated successfully',
    data: { pdfUrl },
  });
});

const regeneratePrintLayout = catchAsync(async (req, res) => {
  const { photoId } = req.params as { photoId: string };
  const { copies, paperSize } = req.body;

  const result = await PhotoServices.regeneratePrintLayoutLocal(photoId, copies, paperSize);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message:
      'Copies/paper size updated successfully. Regenerate print-layout/converter/pdf to get fresh files.',
    data: result,
  });
});

const getAllPhotos = catchAsync(async (req, res) => {
  const userId = (req as any).user?.id;

  const result = await PhotoServices.getAllPhotosForUser(userId);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Photos retrieved successfully',
    data: result,
  });
});

export const PhotoControllers = {
  createPhoto,
  generatePrintLayout,
  convertPrintLayout,
  generatePdf,
  regeneratePrintLayout,
  getAllPhotos,
};
