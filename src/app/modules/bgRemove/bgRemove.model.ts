import mongoose, { Schema } from 'mongoose';
import { BG_REMOVE_STATUS } from './bgRemove.constant';
import { IBgRemove } from './bgRemove.interface';

const bgRemoveSchema = new Schema<IBgRemove>(
  {
    originalImage: {
      type: String,
      required: true,
    },

    processedImage: {
      type: String,
    },

    bgColor: {
      type: String,
    },

    status: {
      type: String,
      enum: BG_REMOVE_STATUS,
      default: BG_REMOVE_STATUS.PENDING,
    },

    errorMessage: {
      type: String,
    },

    bgRemovePhotoId: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

bgRemoveSchema.index({ createdAt: -1 });
bgRemoveSchema.index({ status: 1 });

export const BgRemove = mongoose.model<IBgRemove>('BgRemove', bgRemoveSchema);
