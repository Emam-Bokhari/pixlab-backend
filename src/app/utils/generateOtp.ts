import crypto from 'crypto';

export const generateSecureOTP = (length: number = 6): string => {
  if (![4, 5, 6].includes(length)) {
    throw new Error('Invalid OTP length');
  }

  const otp = crypto.randomInt(10 ** (length - 1), 10 ** length);

  return otp.toString();
};
