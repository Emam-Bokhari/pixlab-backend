import bcrypt from 'bcrypt';
import config from '../config';
import { logger } from '../shared/logger';

/**
 * Hash an OTP before saving to DB
 */
export const hashOTP = async (otp: string): Promise<string> => {
  return bcrypt.hash(otp, Number(config.otp_salt_rounds));
};

/**
 * Verify a plain OTP against the hashed OTP stored in DB
 * @param plainOTP - user provided OTP
 * @param hashedOTP - hashed OTP from DB
 */
export const verifyHashedOTP = async (
  plainOTP: string | number,
  hashedOTP: string,
): Promise<boolean> => {
  try {
    return await bcrypt.compare(plainOTP.toString(), hashedOTP);
  } catch (err) {
    logger.error('Error comparing OTPs:', err);
    // Fail safe: if comparison fails, treat as invalid OTP
    return false;
  }
};
