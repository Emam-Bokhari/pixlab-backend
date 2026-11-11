import catchAsync from '../../shared/catchAsync';
import { ResizeServices } from './resize.service';
import sendResponse from '../../shared/sendResponse';
import { isBinaryRequested, sendBinaryResponse } from '../../shared/sendBinaryResponse';

const resizePhoto = catchAsync(async (req, res) => {
  const result = await ResizeServices.resizeImage(req.file, {
    width: req.body?.width,
    height: req.body?.height,
  });

  if (isBinaryRequested(req)) {
    return sendBinaryResponse(res, result.binary);
  }

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Image resized successfully',
    data: result.data,
  });
});

export const ResizeControllers = {
  resizePhoto,
};
