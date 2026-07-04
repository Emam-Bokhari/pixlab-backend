import mongoose from 'mongoose';

export interface IRefreshToken {
  user: mongoose.Types.ObjectId; // user ID
  tokenHash: string; // JWT refresh token
  expiresAt: Date; // expiry date
  used: boolean; // single-use token flag
  createdAt?: Date;
  updatedAt?: Date;
}
