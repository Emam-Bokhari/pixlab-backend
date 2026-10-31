import { USER_ROLE } from '../../types/enum';
import { AUTH_PURPOSE } from './auth.constant';

export interface IAuthUser {
  id: string;
  email: string;
  role: USER_ROLE;
}

export interface ICreateUserPayload {
  email: string;
  firstName?: string;
  lastName?: string;
  password?: string;
  role?: USER_ROLE;
}

export interface IVerifyOTP {
  email: string;
  oneTimeCode: string | number;
  purpose: AUTH_PURPOSE; // signup or reset_password
}

export interface IResendOTPPayload {
  email: string;
  purpose: AUTH_PURPOSE;
}

export interface ILoginPayload {
  email: string;
  password?: string;
}

export interface IAuthResetPassword {
  email: string;
  newPassword: string;
  confirmPassword: string;
}

export interface IChangePassword {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
