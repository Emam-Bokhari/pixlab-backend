import mongoose, { Schema } from 'mongoose';
import { BG_REMOVE_STATUS } from './bgRemove.constant';
import { IBgRemove } from './bgRemove.interface';


const bgRemoveSchema = new Schema<IBgRemove>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

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
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

bgRemoveSchema.index({ userId: 1, createdAt: -1 });
bgRemoveSchema.index({ status: 1 });

export const BgRemove = mongoose.model<IBgRemove>('BgRemove', bgRemoveSchema);