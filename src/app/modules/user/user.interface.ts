import { Model, Types, Document } from 'mongoose';
import { USER_ROLE, USER_STATUS } from '../../types/enum';
import { AUTH_PURPOSE } from '../auth/auth.constant';
import { ISoftDeleteMethods, ISoftDeleteStatics } from '../../DB/plugins/softDelete.plugin';

export type TUser = {
  name: string;
  profileImage?: string;
  email: string;
  password: string;
  role: USER_ROLE;
  isVerified: boolean;
  isActive: boolean;
  isDeleted: boolean;
  deletedAt?: Date;
  status?: USER_STATUS;
  lastLoginAt?: Date;
  authentication?: {
    purpose: AUTH_PURPOSE;
    oneTimeCode: string;
    expireAt: Date;
    attempts: number;
  };
};

export interface UserDocument extends TUser, Document, ISoftDeleteMethods {
  _id: Types.ObjectId;
}

export interface UserModel extends Model<UserDocument>, ISoftDeleteStatics<UserDocument> {
  isExistUserById(id: string): Promise<UserDocument | null>;
  isExistUserByEmail(email: string): Promise<UserDocument | null>;
  isMatchPassword(password: string, hashPassword: string): Promise<boolean>;
}
