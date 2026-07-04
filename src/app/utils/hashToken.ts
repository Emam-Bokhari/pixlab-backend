import bcrypt from 'bcrypt';
import config from '../config';

export const hashToken = async (token: string) => {
  return bcrypt.hash(token, Number(config.bcrypt_salt_rounds));
};

export const verifyHashedToken = async (token: string, hash: string) => {
  return bcrypt.compare(token, hash);
};
