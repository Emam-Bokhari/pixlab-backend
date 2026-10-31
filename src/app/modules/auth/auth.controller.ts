import catchAsync from '../../shared/catchAsync';
import sendResponse from '../../shared/sendResponse';
import { IAuthUser } from './auth.interface';
import { AuthServices } from './auth.service';

const createUser = catchAsync(async (req, res) => {
  const userData = req.body;
  const result = await AuthServices.createUserToDB(userData);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: result.message,
    data: null,
  });
});

const verifyOTP = catchAsync(async (req, res) => {
  const otpData = req.body;
  const result = await AuthServices.verifyOTPToDB(otpData);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: result.message,
    data: result,
  });
});

const resendOTP = catchAsync(async (req, res) => {
  const otpData = req.body;
  const result = await AuthServices.resendOTPToDB(otpData);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: result.message,
    data: null,
  });
});

const loginUser = catchAsync(async (req, res) => {
  const loginData = req.body;
  const result = await AuthServices.loginUserFromDB(loginData);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'User logged in successfully',
    data: result,
  });
});

const forgetPassword = catchAsync(async (req, res) => {
  const { email } = req.body;
  await AuthServices.forgetPasswordToDB(email);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'OTP sent successfully',
    data: null,
  });
});

const resetPassword = catchAsync(async (req, res) => {
  const { token } = req.headers;
  const resetData = req.body;
  const result = await AuthServices.resetPasswordToDB(token as string, resetData);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Password reset successfully',
    data: result,
  });
});

const changePassword = catchAsync(async (req, res) => {
  const user: IAuthUser = req.user as IAuthUser;
  const result = await AuthServices.changePasswordToDB(user, req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Password changed successfully',
    data: result,
  });
});

const refreshAccessToken = catchAsync(async (req, res) => {
  const { refreshToken } = req.body;
  const result = await AuthServices.refreshAccessToken(refreshToken);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Access token refreshed successfully',
    data: result,
  });
});

export const AuthControllers = {
  createUser,
  verifyOTP,
  resendOTP,
  loginUser,
  forgetPassword,
  resetPassword,
  changePassword,
  refreshAccessToken,
};
