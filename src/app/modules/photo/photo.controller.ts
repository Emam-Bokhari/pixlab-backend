import catchAsync from '../../shared/catchAsync';
import sendResponse from '../../shared/sendResponse';
import { PhotoServices } from './photo.service';

// ---------------------------------------------------------------------
// STEP 1 — POST /photos
// multipart/form-data: file field (multer) + body fields
// (photoType, bgColor, copies, paperSize, sizeInfo, originalImage).
// Fast: only calls Cutout Pro + saves the single processed image.
// ---------------------------------------------------------------------
const createPhoto = catchAsync(async (req, res) => {
  const { id: userId } = req.user as { id: string };
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

// // ---------------------------------------------------------------------
// // STEP 2 — POST /photos/:photoId/print-layout
// // "Print Layout" button — composites the centered studio sheet if it
// // doesn't already exist, and returns the updated photo doc.
// // ---------------------------------------------------------------------
// const generatePrintLayout = catchAsync(async (req, res) => {
//   const { photoId } = req.params as { photoId: string };

//   const result = await PhotoServices.generatePrintLayout(photoId);

//   sendResponse(res, {
//     success: true,
//     statusCode: 200,
//     message: 'Print layout generated successfully',
//     data: result,
//   });
// });

// // ---------------------------------------------------------------------
// // STEP 3 — POST /photos/:photoId/convert
// // "Converter" button — png/jpg/webp of the print layout sheet.
// // ---------------------------------------------------------------------
// const convertPrintLayout = catchAsync(async (req, res) => {
//   const { photoId } = req.params as { photoId: string };

//   const result = await PhotoServices.convertPrintLayout(photoId);

//   sendResponse(res, {
//     success: true,
//     statusCode: 200,
//     message: 'Layout converted to png/jpg/webp successfully',
//     data: result,
//   });
// });

// // ---------------------------------------------------------------------
// // STEP 4 — POST /photos/:photoId/pdf
// // "Generate PDF" button.
// // ---------------------------------------------------------------------
// const generatePdf = catchAsync(async (req, res) => {
//   const { photoId } = req.params as { photoId: string };

//   const pdfUrl = await PhotoServices.generatePdf(photoId);

//   sendResponse(res, {
//     success: true,
//     statusCode: 200,
//     message: 'PDF generated successfully',
//     data: { pdfUrl },
//   });
// });

// // ---------------------------------------------------------------------
// // PATCH /photos/:photoId/regenerate
// // Changes copies/paperSize and invalidates previously rendered outputs.
// // Client should call print-layout/converter/pdf again afterwards to
// // get the regenerated files.
// // ---------------------------------------------------------------------
// const regeneratePrintLayout = catchAsync(async (req, res) => {
//   const { photoId } = req.params as { photoId: string };
//   const { copies, paperSize } = req.body;

//   const result = await PhotoServices.regeneratePrintLayoutLocal(photoId, copies, paperSize);

//   sendResponse(res, {
//     success: true,
//     statusCode: 200,
//     message: 'Copies/paper size updated successfully. Regenerate print-layout/converter/pdf to get fresh files.',
//     data: result,
//   });
// });

// export const PhotoControllers = {
//   createPhoto,
//   generatePrintLayout,
//   convertPrintLayout,
//   generatePdf,
//   regeneratePrintLayout,
// };

// ---------------------------------------------------------------------
// STEP 2 — POST /photos/:photoId/print-layout
// "Print Layout" button — composites the centered studio sheet if it
// doesn't already exist, and returns the updated photo doc.
// ---------------------------------------------------------------------
const generatePrintLayout = catchAsync(async (req, res) => {
  const { id: userId } = req.user as { id: string };

  const { photoId } = req.params as { photoId: string };
  const { copies, paperSize } = req.body;

  const result = await PhotoServices.generatePrintLayout(photoId, userId, { copies, paperSize });

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Print layout generated successfully',
    data: result,
  });
});

// ---------------------------------------------------------------------
// STEP 3 — POST /photos/:photoId/convert
// "Converter" button — png/jpg/webp of the print layout sheet.
// ---------------------------------------------------------------------
const convertPrintLayout = catchAsync(async (req, res) => {
  const { id: userId } = req.user as { id: string };

  const { photoId } = req.params as { photoId: string };

  const result = await PhotoServices.convertPrintLayout(photoId, userId);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Layout converted to png/jpg/webp successfully',
    data: result,
  });
});

// ---------------------------------------------------------------------
// STEP 4 — POST /photos/:photoId/pdf
// "Generate PDF" button.
// ---------------------------------------------------------------------
const generatePdf = catchAsync(async (req, res) => {
  const { id: userId } = req.user as { id: string };

  const { photoId } = req.params as { photoId: string };
  const { copies, paperSize } = req.body;

  const pdfUrl = await PhotoServices.generatePdf(photoId, userId, { copies, paperSize });

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'PDF generated successfully',
    data: { pdfUrl },
  });
});

// ---------------------------------------------------------------------
// PATCH /photos/:photoId/regenerate
// Changes copies/paperSize and invalidates previously rendered outputs.
// Client should call print-layout/converter/pdf again afterwards to
// get the regenerated files.
// ---------------------------------------------------------------------
const regeneratePrintLayout = catchAsync(async (req, res) => {
  const { id: userId } = req.user as { id: string };

  const { photoId } = req.params as { photoId: string };
  const { copies, paperSize } = req.body;

  const result = await PhotoServices.regeneratePrintLayoutLocal(photoId, userId, copies, paperSize);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message:
      'Copies/paper size updated successfully. Regenerate print-layout/converter/pdf to get fresh files.',
    data: result,
  });
});

const getAllPhotos = catchAsync(async (req, res) => {
  const { id: userId } = req.user as { id: string };

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
