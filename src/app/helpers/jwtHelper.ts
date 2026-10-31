import jwt, { JwtPayload, Secret } from 'jsonwebtoken';
import { HttpError } from '../errors/HttpError';
import { USER_ROLE } from '../types/enum';

export interface TokenPayload {
  id: string;
  email: string;
  role: USER_ROLE;
  [key: string]: any; // optional extra fields
}

const createToken = (payload: TokenPayload, secret: Secret, expiresIn: string = '15m') => {
  if (!secret) {
    throw new Error('Secret must be provided');
  }

  return jwt.sign(payload, secret, {
    expiresIn,
    algorithm: 'HS512',
    issuer: 'photolagbe',
  } as jwt.SignOptions);
};

const verifyToken = (token: string, secret: Secret) => {
  if (!secret) {
    throw new Error('Secret must be provided');
  }

  try {
    return jwt.verify(token, secret, {
      algorithms: ['HS512'],
      issuer: 'photolagbe',
    }) as JwtPayload;
  } catch (err) {
    throw new HttpError(401, 'Invalid or expired token');
  }
};

export const jwtHelper = { createToken, verifyToken };
