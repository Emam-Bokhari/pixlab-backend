import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcrypt';

import { USER_ROLE, USER_STATUS } from '../../types/enum';
import { AUTH_PURPOSE } from '../auth/auth.constant';
import { TUser, UserModel } from './user.interface';
import { softDeletePlugin } from '../../DB/plugins/softDelete.plugin';

/* ---------- Authentication Schema ---------- */
const authenticationSchema = new Schema(
  {
    purpose: {
      type: String,
      enum: Object.values(AUTH_PURPOSE),
      required: true,
    },

    oneTimeCode: {
      type: String,
      required: true,
      select: false, // never expose OTP
    },

    expireAt: {
      type: Date,
      required: true,
    },

    attempts: {
      type: Number,
      default: 0,
      min: 0,
      max: 3,
    },
  },
  {
    _id: false,
  },
);

/* ---------- User Schema ---------- */
const userSchema = new Schema<TUser, UserModel>(
  {
    name: { type: String, required: true },

    profileImage: { type: String },

    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    password: {
      type: String,
      required: true,
      select: false, // security best practice
    },

    role: {
      type: String,
      enum: Object.values(USER_ROLE),
      default: USER_ROLE.USER,
    },

    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },

    status: {
      type: String,
      enum: Object.values(USER_STATUS),
      default: USER_STATUS.ACTIVE,
    },

    lastLoginAt: { type: Date },

    authentication: authenticationSchema,
  },
  {
    timestamps: true,
    versionKey: false,
  },
);


userSchema.statics.isExistUserById = function (id: string) {
  return this.findById(id);
};

userSchema.statics.isExistUserByEmail = function (email: string) {
  return this.findOne({ email });
};

userSchema.statics.isMatchPassword = async function (password: string, hashPassword: string) {
  return bcrypt.compare(password, hashPassword);
};

userSchema.plugin(softDeletePlugin);

export const User = mongoose.model<TUser, UserModel>('User', userSchema);
