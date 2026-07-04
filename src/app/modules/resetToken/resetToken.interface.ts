import { Document, Types } from 'mongoose';

export interface IResetToken extends Document {
  user: Types.ObjectId; // reference to the User
  tokenHash: string; // securely generated token
  expireAt: Date; // token expiration
  used: boolean; // whether the token has been used
  createdAt: Date; // optional: created timestamp
}
