import catchAsync from '../../shared/catchAsync';
import { ReduceServices } from './reduce.service';
import sendResponse from '../../shared/sendResponse';
import { isBinaryRequested, sendBinaryResponse } from '../../shared/sendBinaryResponse';

const reducePhoto = catchAsync(async (req, res) => {
  const result = await ReduceServices.reduceImageSize(req.file, req.body?.targetSizeKb);

  if (isBinaryRequested(req)) {
    return sendBinaryResponse(res, result.binary);
  }

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Image reduced successfully',
    data: result.data,
  });
});

export const ReduceControllers = {
  reducePhoto,
};
