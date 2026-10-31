import { Secret } from 'jsonwebtoken';
import config from '../../config';
import { jwtHelper } from '../../helpers/jwtHelper';
import { User } from '../user/user.model';
import { RefreshToken } from '../refreshToken/refreshToken.model';
import { hashToken } from '../../utils/hashToken';
import { HttpError } from '../../errors/HttpError';
import { AUTH_PURPOSE } from './auth.constant';
import { USER_ROLE } from '../../types/enum';

// clear authentication data
export const clearAuthentication = async (userId: string) => {
  await User.findByIdAndUpdate(userId, {
    $set: {
      authentication: {
        purpose: null,
        oneTimeCode: null,
        expireAt: null,
        attempts: 0,
      },
    },
  });
};

// prevent OTP spam
export const preventOtpSpam = (auth: any, purpose: AUTH_PURPOSE) => {
  if (auth?.purpose === purpose && auth.expireAt && auth.expireAt > new Date()) {
    const remaining = Math.ceil((auth.expireAt.getTime() - Date.now()) / 1000);
    throw new HttpError(429, `OTP already sent. Try again in ${remaining} seconds.`);
  }
};

export const generateTokens = async (payload: {
  userId: string;
  email: string;
  role: USER_ROLE;
}) => {
  const accessToken = jwtHelper.createToken(
    {
      id: payload.userId,
      email: payload.email,
      role: payload.role,
      type: 'access',
    },
    config.jwt.jwt_secret as Secret,
    config.jwt.jwt_expire_in as string,
  );

  const refreshToken = jwtHelper.createToken(
    {
      id: payload.userId,
      email: payload.email,
      role: payload.role,
      type: 'refresh',
    },
    config.jwt.jwt_refresh_secret as Secret,
    config.jwt.jwt_refresh_expire_in as string,
  );

  const hashedRefreshToken = await hashToken(refreshToken);

  await RefreshToken.create({
    user: payload.userId,
    tokenHash: hashedRefreshToken,
    expiresAt: new Date(Date.now() + parseJwtExpiry(config.jwt.jwt_refresh_expire_in as string)),
    used: false,
  });

  return { accessToken, refreshToken };
};

// helper function to convert "7d" or "15m" to ms
const parseJwtExpiry = (expireIn: string): number => {
  const unit = expireIn.slice(-1);
  const value = Number(expireIn.slice(0, -1));
  if (unit === 'd') return value * 24 * 60 * 60 * 1000;
  if (unit === 'h') return value * 60 * 60 * 1000;
  if (unit === 'm') return value * 60 * 1000;
  if (unit === 's') return value * 1000;
  return value;
};
