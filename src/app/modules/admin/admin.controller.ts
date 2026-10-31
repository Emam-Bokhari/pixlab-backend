import catchAsync from '../../shared/catchAsync';
import sendResponse from '../../shared/sendResponse';
import { AdminServices } from './admin.service';

const createAdmin = catchAsync(async (req, res) => {
  const result = await AdminServices.createAdminToDB(req.body);

  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: 'Admin created successfully',
    data: result,
  });
});

const getAllAdmins = catchAsync(async (req, res) => {
  const result = await AdminServices.getAllAdminsFromDB();

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Admins retrieved successfully',
    data: result,
  });
});

const deleteAdmin = catchAsync(async (req, res) => {
  const { adminId } = req.params as { adminId: string };
  const result = await AdminServices.deleteAdminFromDB(adminId);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Admin deleted successfully',
    data: result,
  });
});

export const AdminControllers = {
  createAdmin,
  getAllAdmins,
  deleteAdmin,
};
