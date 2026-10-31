import catchAsync from '../../shared/catchAsync';
import sendResponse from '../../shared/sendResponse';
import { SupportServices } from './support.service';

const createSupport = catchAsync(async (req, res) => {
  const result = await SupportServices.createSupportToDB(req.body);

  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: 'Support request created successfully',
    data: result,
  });
});

export const SupportControllers = {
  createSupport,
};
