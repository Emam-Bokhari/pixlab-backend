import express from 'express';
import { AuthControllers } from './auth.controller';
import { validateRequestSchema } from '../../middlewares/validateRequestSchema';
import { AuthValidationSchema } from './auth.validation';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../../types/enum';

const router = express.Router();

router.post(
  '/register',
  validateRequestSchema(AuthValidationSchema.createUserValidationSchema),
  AuthControllers.createUser,
);

router.post(
  '/login',
  validateRequestSchema(AuthValidationSchema.loginUserValidationSchema),
  AuthControllers.loginUser,
);

router.post(
  '/verify-otp',
  validateRequestSchema(AuthValidationSchema.verifyOTPValidationSchema),
  AuthControllers.verifyOTP,
);

router.post(
  '/resend-otp',
  validateRequestSchema(AuthValidationSchema.resendOtpValidationSchema),
  AuthControllers.resendOTP,
);

router.post(
  '/forget-password',
  validateRequestSchema(AuthValidationSchema.forgetPasswordValidationSchema),
  AuthControllers.forgetPassword,
);

router.post(
  '/reset-password',
  validateRequestSchema(AuthValidationSchema.resetPasswordValidationSchema),
  AuthControllers.resetPassword,
);

router.post(
  '/change-password',
  auth(USER_ROLE.ADMIN, USER_ROLE.USER, USER_ROLE.SUPER_ADMIN),
  validateRequestSchema(AuthValidationSchema.changePasswordValidationSchema),
  AuthControllers.changePassword,
);

router.post(
  '/refresh-token',
  validateRequestSchema(AuthValidationSchema.refreshTokenValidationSchema),
  AuthControllers.refreshAccessToken,
);

export const AuthRoutes = router;
