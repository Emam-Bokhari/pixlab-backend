import { JwtPayload, Secret } from 'jsonwebtoken';
import config from '../../config';
import { HttpError } from '../../errors/HttpError';
import { emailTemplate } from '../../shared/emailTemplate';
import { USER_ROLE, USER_STATUS } from '../../types/enum';
import { generateSecureOTP } from '../../utils/generateOtp';
import { generateSecret } from '../../utils/generateSecret';
import { hashOTP, verifyHashedOTP } from '../../utils/hashOtp';
import { hashToken, verifyHashedToken } from '../../utils/hashToken';
import { RefreshToken } from '../refreshToken/refreshToken.model';
import { ResetToken } from '../resetToken/resetToken.model';
import { User } from '../user/user.model';
import { AUTH_PURPOSE } from './auth.constant';
import {
  IAuthResetPassword,
  IChangePassword,
  ICreateUserPayload,
  ILoginPayload,
  IResendOTPPayload,
  IVerifyOTP,
} from './auth.interface';
import { clearAuthentication, generateTokens, preventOtpSpam } from './auth.utils';
import bcrypt from 'bcrypt';
import { jwtHelper } from '../../helpers/jwtHelper';
import { sendRealtimeNotification } from '../../helpers/notificationHelper';
import { NOTIFICATION_TYPE } from '../notification/notification.constant';
import { emailQueue } from '../../../queues';

// constants
const MAX_OTP_ATTEMPTS = Number(config.max_otp_attempts);
const OTP_EXPIRY_MS = 3 * 60 * 1000; // 3 minutes
const RESET_TOKEN_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

const createUserToDB = async (payload: ICreateUserPayload) => {
  let user = await User.findOne({ email: payload.email }).select('+authentication');
  if (user) preventOtpSpam(user.authentication, AUTH_PURPOSE.SIGNUP);

  const hashedPassword = await bcrypt.hash(
    payload.password || '',
    Number(config.bcrypt_salt_rounds),
  );

  payload.password = hashedPassword;

  user = user ?? (await User.create(payload));
  if (!user) throw new HttpError(400, 'Failed to create user');

  const otp = generateSecureOTP();
  const hashedOTP = await hashOTP(otp);

  const emailData = emailTemplate.createAccount({
    name: user.name || '',
    email: user.email,
    otp: Number(otp),
  });

  await emailQueue.add('sendSignupOTP', {
    email: user.email,
    subject: 'PhotoLagbe Account Verification',
    body: emailData.html,
  });

  await User.findByIdAndUpdate(user._id, {
    $set: {
      authentication: {
        purpose: AUTH_PURPOSE.SIGNUP,
        oneTimeCode: hashedOTP,
        expireAt: new Date(Date.now() + OTP_EXPIRY_MS),
        attempts: 0,
      },
    },
  });

  // send notification to admin
  const admins = await User.find({
    role: { $in: [USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN] },
  }).select('_id');

  const adminIds = admins.map((admin) => admin._id.toString());

  if (adminIds.length > 0) {
    sendRealtimeNotification(adminIds, {
      title: 'New user registered',
      body: `${user.name} has created a new account.`,
      type: NOTIFICATION_TYPE.NEW_USER_REGISTRATION,
    });
  }

  return { message: 'OTP sent successfully' };
};

// verify OTP
const verifyOTPToDB = async (payload: IVerifyOTP) => {
  const { email, oneTimeCode, purpose } = payload;

  const user = await User.findOne({
    email,
    'authentication.purpose': purpose,
  }).select('+authentication +authentication.oneTimeCode');

  if (!user || !user.authentication?.oneTimeCode) {
    throw new HttpError(400, "User doesn' exist or OTP not issued");
  }

  const auth = user.authentication;
  if (auth.purpose !== purpose) throw new HttpError(400, 'OTP purpose mismatch');
  if (auth.attempts >= MAX_OTP_ATTEMPTS) throw new HttpError(400, 'Maximum OTP attempts exceeded');
  if (new Date() > auth.expireAt) throw new HttpError(400, 'OTP expired, request a new one');

  const isValid = await verifyHashedOTP(oneTimeCode, auth.oneTimeCode);
  if (!isValid) {
    await User.findByIdAndUpdate(user._id, {
      $inc: { 'authentication.attempts': 1 },
    });
    throw new HttpError(400, 'Invalid OTP provided');
  }

  let response: {
    message: string;
    accessToken?: string;
    refreshToken?: string;
    resetToken?: string;
  } = { message: '' };

  if (purpose === AUTH_PURPOSE.SIGNUP) {
    await User.findByIdAndUpdate(user._id, { isVerified: true });
    await clearAuthentication(user._id.toString());

    user.isVerified = true;

    const tokens = await generateTokens({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    response.message = 'Email verified successfully';
    response.accessToken = tokens.accessToken;
    response.refreshToken = tokens.refreshToken;
  } else if (purpose === AUTH_PURPOSE.RESET_PASSWORD) {
    const resetToken = generateSecret();
    const tokenHash = await hashToken(resetToken);

    await ResetToken.updateMany({ user: user._id, used: false }, { used: true });

    await ResetToken.create({
      user: user._id,
      tokenHash,
      expireAt: new Date(Date.now() + RESET_TOKEN_EXPIRY_MS),
      used: false,
    });

    await clearAuthentication(user._id.toString());

    response.message = 'OTP verified. Use this reset token to change your password';
    response.resetToken = resetToken;
  } else {
    throw new HttpError(400, 'Invalid OTP purpose');
  }

  return response;
};

// resend OTP
const resendOTPToDB = async ({ email, purpose }: IResendOTPPayload) => {
  const user = await User.findOne({ email }).select('+authentication');
  if (!user) throw new HttpError(400, 'User not found');

  preventOtpSpam(user.authentication, purpose);

  const otp = generateSecureOTP();
  const hashedOTP = await hashOTP(otp);

  await User.findByIdAndUpdate(user._id, {
    $set: {
      authentication: {
        purpose,
        oneTimeCode: hashedOTP,
        expireAt: new Date(Date.now() + OTP_EXPIRY_MS),
        attempts: 0,
      },
    },
  });

  const emailValues = {
    name: user.name || '',
    email: user.email,
    otp: Number(otp),
  };

  if (purpose === AUTH_PURPOSE.SIGNUP)
    await emailQueue.add('sendSignupOTP', {
      email: user.email,
      subject: 'PhotoLagbe Account Verification',
      body: emailTemplate.createAccount(emailValues).html,
    });
  else if (purpose === AUTH_PURPOSE.RESET_PASSWORD)
    await emailQueue.add('sendResetPasswordOTP', {
      email: user.email,
      subject: 'PhotoLagbe Password Reset',
      body: emailTemplate.resetPassword(emailValues).html,
    });

  return { message: 'OTP resent successfully' };
};

// login
const loginUserFromDB = async (payload: ILoginPayload) => {
  const { email, password } = payload;
  const user = await User.findOne({ email }).select('+password +authentication');

  if (!user) throw new HttpError(400, 'User not found');
  if (!user.isVerified) throw new HttpError(400, 'Please verify your account before logging in');
  if (user.isDeleted || (user.status && user.status === USER_STATUS.BLOCKED))
    throw new HttpError(400, 'Account deactivated or blocked');

  if (password) {
    if (!user.password) throw new HttpError(400, 'Password not set. Use OAuth provider');
    const isMatch = await User.isMatchPassword(password, user.password);
    if (!isMatch) throw new HttpError(400, 'Incorrect password');
  }

  // mark all previous refresh tokens as used
  await RefreshToken.updateMany({ user: user._id, used: false }, { $set: { used: true } });

  // update last login time in database
  const lastLoginAt = new Date();
  await User.findByIdAndUpdate(user._id, { lastLoginAt });

  const tokens = await generateTokens({
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
  });

  const safeUser = {
    _id: user._id,
    email: user.email,
    role: user.role,
    isDeleted: user.isDeleted,
    status: user.status,
    name: user?.name || '',
    lastLoginAt,
  };

  return {
    user: safeUser,
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
  };
};

// forget password
const forgetPasswordToDB = async (email: string) => {
  const user = await User.findOne({ email }).select(
    '_id email isVerified isDeleted authentication',
  );
  if (!user) throw new HttpError(400, 'User not found');
  if (!user.isVerified) throw new HttpError(400, 'Please verify your account first');

  preventOtpSpam(user.authentication, AUTH_PURPOSE.RESET_PASSWORD);

  const otp = generateSecureOTP();
  const hashedOtp = await hashOTP(otp);

  await emailQueue.add('sendResetPasswordOTP', {
    email: user.email,
    subject: 'PhotoLagbe Password Reset',
    body: emailTemplate.resetPassword({ email: user.email, otp: Number(otp) }).html,
  });

  await User.updateOne(
    { _id: user._id },
    {
      $set: {
        authentication: {
          oneTimeCode: hashedOtp,
          purpose: AUTH_PURPOSE.RESET_PASSWORD,
          expireAt: new Date(Date.now() + OTP_EXPIRY_MS),
          attempts: 0,
        },
      },
    },
  );
};

// reset password
const resetPasswordToDB = async (token: string, payload: IAuthResetPassword) => {
  const { email, newPassword, confirmPassword } = payload;

  const user = await User.findOne({ email });
  if (!user) {
    throw new HttpError(400, 'User not found');
  }

  const resetToken = await ResetToken.findOne({
    user: user._id,
    used: false,
    expireAt: { $gt: new Date() },
  });

  if (!resetToken) {
    throw new HttpError(400, 'Invalid or expired reset token');
  }

  const isValid = await verifyHashedToken(token, resetToken.tokenHash);
  if (!isValid) {
    throw new HttpError(400, 'Invalid or expired reset token');
  }

  if (newPassword !== confirmPassword) {
    throw new HttpError(400, 'Passwords do not match');
  }

  const hashedPassword = await bcrypt.hash(newPassword, Number(config.bcrypt_salt_rounds));

  await User.updateOne({ _id: user._id }, { password: hashedPassword });

  // one-time use
  resetToken.used = true;
  await resetToken.save();

  // all refresh tokens for this user are invalidated
  await RefreshToken.updateMany({ user: user._id, used: false }, { used: true });

  await clearAuthentication(user._id.toString());

  return await generateTokens({
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
  });
};

// change password
const changePasswordToDB = async (user: JwtPayload, payload: IChangePassword) => {
  const { currentPassword, newPassword, confirmPassword } = payload;

  const existingUser = await User.findById(user.id).select('+password');
  if (!existingUser || !existingUser.password)
    throw new HttpError(400, 'User not found or password not set');

  const isCurrentPasswordValid = await User.isMatchPassword(currentPassword, existingUser.password);
  if (!isCurrentPasswordValid) throw new HttpError(400, 'Current password is incorrect');
  if (currentPassword === newPassword)
    throw new HttpError(400, 'New password must be different from current password');

  if (newPassword !== confirmPassword) throw new HttpError(400, 'Passwords do not match');

  const hashedPassword = await bcrypt.hash(newPassword, Number(config.bcrypt_salt_rounds));
  await User.updateOne({ _id: user.id }, { $set: { password: hashedPassword } });

  //  IMPORTANT SECURITY STEPS
  await ResetToken.updateMany({ user: user.id, used: false }, { $set: { used: true } });

  await RefreshToken.updateMany({ user: user.id, used: false }, { $set: { used: true } });

  await clearAuthentication(user.id);
};

// refresh access token
const refreshAccessToken = async (refreshToken: string) => {
  const decoded = jwtHelper.verifyToken(
    refreshToken,
    config.jwt.jwt_refresh_secret as Secret,
  ) as JwtPayload;

  if (decoded.type !== 'refresh' || !decoded.id) {
    throw new HttpError(400, 'Invalid refresh token');
  }

  const user = await User.findById(decoded.id);
  if (!user) {
    throw new HttpError(400, 'User not found');
  }

  if (user.isDeleted || user.status === USER_STATUS.BLOCKED) {
    throw new HttpError(400, 'Account disabled');
  }

  const storedTokens = await RefreshToken.find({
    user: user._id,
    used: false,
    expiresAt: { $gt: new Date() },
  });

  let matchedToken = null;

  for (const rt of storedTokens) {
    const isMatch = await verifyHashedToken(refreshToken, rt.tokenHash);
    if (isMatch) {
      matchedToken = rt;
      break;
    }
  }

  // reuse detection
  if (!matchedToken) {
    await RefreshToken.updateMany({ user: user._id }, { $set: { used: true } });

    await clearAuthentication(user._id.toString());

    throw new HttpError(400, 'Refresh token reuse detected');
  }

  // rotate refresh tokens (invalidate all)
  await RefreshToken.updateMany({ user: user._id, used: false }, { $set: { used: true } });

  return await generateTokens({
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
  });
};

export const AuthServices = {
  createUserToDB,
  verifyOTPToDB,
  resendOTPToDB,
  loginUserFromDB,
  forgetPasswordToDB,
  resetPasswordToDB,
  changePasswordToDB,
  refreshAccessToken,
};
