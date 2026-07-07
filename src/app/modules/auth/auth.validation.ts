import { z } from 'zod';
import { AUTH_PURPOSE } from './auth.constant';
import { USER_ROLE } from '../../types/enum';

const createUserValidationSchema = z.object({
  body: z.object({
    email: z
      .string({ message: 'Email is required' })
      .trim()
      .email({ message: 'Invalid email address' }),
    name: z
      .string({ message: 'Name is required' })
      .trim()
      .min(4, 'Name must be at least 4 characters'),
    password: z
      .string({ message: 'Password is required' })
      .min(6, 'Password must be at least 6 characters'),
    role: z.enum(Object.values(USER_ROLE) as [string, ...string[]]).optional(),
  }),
});

const loginUserValidationSchema = z.object({
  body: z.object({
    email: z
      .string({ message: 'Email is required' })
      .trim()
      .email({ message: 'Invalid email address' }),
    password: z.string({ message: 'Password is required' }),
  }),
});

const verifyOTPValidationSchema = z.object({
  body: z.object({
    email: z
      .string({ message: 'Email is required' })
      .trim()
      .email({ message: 'Invalid email address' }),
    oneTimeCode: z.union([z.string(), z.number()], {
      message: 'OTP is required',
    }),
    purpose: z.enum(Object.values(AUTH_PURPOSE) as [string, ...string[]], {
      message: 'Purpose is required',
    }),
  }),
});

const resendOtpValidationSchema = z.object({
  body: z.object({
    email: z
      .string({ message: 'Email is required' })
      .trim()
      .email({ message: 'Invalid email address' }),
    purpose: z.enum(Object.values(AUTH_PURPOSE) as [string, ...string[]], {
      message: 'Purpose is required',
    }),
  }),
});

const forgetPasswordValidationSchema = z.object({
  body: z.object({
    email: z
      .string({ message: 'Email is required' })
      .trim()
      .email({ message: 'Invalid email address' }),
  }),
});

const resetPasswordValidationSchema = z.object({
  body: z
    .object({
      email: z
        .string({ message: 'Email is required' })
        .trim()
        .email({ message: 'Invalid email address' }),
      newPassword: z
        .string({ message: 'New password is required' })
        .min(6, 'Password must be at least 6 characters'),
      confirmPassword: z.string({ message: 'Confirm password is required' }),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: "Passwords don't match",
      path: ['confirmPassword'],
    }),
});

const changePasswordValidationSchema = z.object({
  body: z
    .object({
      currentPassword: z.string({ message: 'Current password is required' }),
      newPassword: z
        .string({ message: 'New password is required' })
        .min(6, 'Password must be at least 6 characters'),
      confirmPassword: z.string({ message: 'Confirm password is required' }),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: "Passwords don't match",
      path: ['confirmPassword'],
    }),
});

const refreshTokenValidationSchema = z.object({
  body: z.object({
    refreshToken: z.string({ message: 'Refresh token is required' }),
  }),
});

export const AuthValidationSchema = {
  createUserValidationSchema,
  loginUserValidationSchema,
  verifyOTPValidationSchema,
  resendOtpValidationSchema,
  forgetPasswordValidationSchema,
  resetPasswordValidationSchema,
  changePasswordValidationSchema,
  refreshTokenValidationSchema,
};
