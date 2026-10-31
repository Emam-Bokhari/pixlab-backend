import catchAsync from '../../shared/catchAsync';
import sendResponse from '../../shared/sendResponse';
import { UserServices } from './user.service';

const getAllUsers = catchAsync(async (req, res) => {
  const result = await UserServices.getAllUsersFromDB();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Users retrieved successfully',
    data: result,
  });
});

const getUserById = catchAsync(async (req, res) => {
  const { userId } = req.params as { userId: string };

  const result = await UserServices.getUserByIdFromDB(userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'User retrieved successfully',
    data: result,
  });
});

const getMyProfile = catchAsync(async (req, res) => {
  const { id: userId } = req.user as { id: string };

  const result = await UserServices.getUserProfileFromDB(userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Profile retrieved successfully',
    data: result,
  });
});

const updateProfile = catchAsync(async (req, res) => {
  const { id: userId } = req.user as { id: string };
  const payload = req.body;

  const result = await UserServices.updateProfileToDB(userId, payload);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Profile updated successfully',
    data: result,
  });
});

const updateUserStatus = catchAsync(async (req, res) => {
  const { userId } = req.params as { userId: string };
  const { status } = req.body;

  const result = await UserServices.updateUserStatusByIdToDB(userId, status);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'User status updated successfully',
    data: result,
  });
});

const deleteUserById = catchAsync(async (req, res) => {
  const { userId } = req.params as { userId: string };

  const result = await UserServices.deleteUserByIdFromDB(userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'User deleted successfully',
    data: result,
  });
});

const deleteMyProfile = catchAsync(async (req, res) => {
  const { id: userId } = req.user as { id: string };
  const { password } = req.body;

  const result = await UserServices.deleteProfileFromDB(userId, password);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Profile deleted successfully',
    data: result,
  });
});

export const UserControllers = {
  getAllUsers,
  getUserById,
  getMyProfile,
  updateProfile,
  updateUserStatus,
  deleteUserById,
  deleteMyProfile,
};
