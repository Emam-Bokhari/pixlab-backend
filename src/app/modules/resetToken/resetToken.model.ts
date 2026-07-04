import mongoose, { Schema } from 'mongoose';
import { IResetToken } from './resetToken.interface';

const resetTokenSchema = new Schema<IResetToken>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    tokenHash: {
      type: String,
      required: true,
    },
    used: {
      type: Boolean,
      default: false,
    },
    expireAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    versionKey: false,
  },
);

// TTL index for automatic deletion
resetTokenSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });

export const ResetToken = mongoose.model<IResetToken>('ResetToken', resetTokenSchema);
