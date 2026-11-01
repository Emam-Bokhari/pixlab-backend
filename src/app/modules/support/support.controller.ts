import catchAsync from '../../shared/catchAsync';
import sendResponse from '../../shared/sendResponse';
import { SupportServices } from './support.service';

const createSupport = catchAsync(async (req, res) => {
  const result = await SupportServices.sendSupportMessage(req.body);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Support message sent successfully',
    data: result,
  });
});

export const SupportControllers = {
  createSupport,
};
