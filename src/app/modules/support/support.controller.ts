import catchAsync from '../../shared/catchAsync';
import sendResponse from '../../shared/sendResponse';
import { IAuthUser } from '../auth/auth.interface';
import { SUPPORT_STATUS } from './support.constant';
import { SupportServices } from './support.service';

const createSupport = catchAsync(async (req, res) => {
  const userId = req.user?.id;

  const result = await SupportServices.createSupportToDB(req.body, userId);

  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: 'Support request created successfully',
    data: result,
  });
});

const getAllSupports = catchAsync(async (req, res) => {
  const result = await SupportServices.getAllSupportsFromDB(req.query);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Support list fetched successfully',
    data: result.data,
    meta: result.meta,
  });
});

const getSupportById = catchAsync(async (req, res) => {
  const { supportId } = req.params as { supportId: string };
  const result = await SupportServices.getSupportByIdFromDB(supportId);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Support fetched successfully',
    data: result,
  });
});

const updateSupportStatusById = catchAsync(async (req, res) => {
  const { supportId } = req.params as { supportId: string };
  const { status } = req.body as { status: SUPPORT_STATUS };

  const result = await SupportServices.updateSupportStatusByIdToDB(supportId, status);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Support status updated successfully',
    data: result,
  });
});

const deleteSupportById = catchAsync(async (req, res) => {
  const { supportId } = req.params as { supportId: string };

  const result = await SupportServices.deleteSupportByIdToDB(supportId);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Support request deleted successfully',
    data: result,
  });
});

export const SupportControllers = {
  createSupport,
  getAllSupports,
  getSupportById,
  updateSupportStatusById,
  deleteSupportById,
};
