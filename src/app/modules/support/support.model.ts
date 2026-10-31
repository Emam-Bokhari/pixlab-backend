import { Schema, model } from 'mongoose';
import { SUPPORT_STATUS } from './support.constant';
import { TSupport } from './support.interface';
import { softDeletePlugin } from '../../DB/plugins/softDelete.plugin';

const supportSchema = new Schema<TSupport>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: [2, 'Name is too short'],
      maxlength: [100, 'Name is too long'],
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },

    subject: {
      type: String,
      required: true,
      trim: true,
      minlength: [5, 'Subject is too short'],
      maxlength: [150, 'Subject is too long'],
    },

    message: {
      type: String,
      required: true,
      trim: true,
      minlength: [10, 'Message is too short'],
      maxlength: [2000, 'Message is too long'],
    },

    status: {
      type: String,
      enum: Object.values(SUPPORT_STATUS),
      default: SUPPORT_STATUS.OPEN,
      index: true,
    },

    isDeleted: {
      type: Boolean,
      index: true,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

supportSchema.index({ email: 1, status: 1 });
supportSchema.index({ createdAt: -1 });

supportSchema.plugin(softDeletePlugin);

export const Support = model<TSupport>('Support', supportSchema);
