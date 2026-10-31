import mongoose, { Schema } from 'mongoose';
import { UPSCALE_STATUS } from './upscale.constant';
import { TUpscale } from './upscale.interface';

const dimensionInfoSchema = new Schema(
  {
    widthPx: { type: Number, required: true },
    heightPx: { type: Number, required: true },
    sizeBytes: { type: Number, required: true },
    sizeKB: { type: Number, required: true },
    sizeMB: { type: Number, required: true },
  },
  { _id: false },
);

const increaseInfoSchema = new Schema(
  {
    widthPercent: { type: Number, required: true },
    heightPercent: { type: Number, required: true },
    sizeBytesPercent: { type: Number, required: true },
    sizeMBDiff: { type: Number, required: true },
  },
  { _id: false },
);

const upscaleSchema = new Schema<TUpscale>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
    },

    originalImage: {
      type: String,
      required: true,
    },

    upscaledImage: {
      type: String,
    },

    original: {
      type: dimensionInfoSchema,
    },

    upscaled: {
      type: dimensionInfoSchema,
    },

    increase: {
      type: increaseInfoSchema,
    },

    didUpscale: {
      type: Boolean,
    },

    warning: {
      type: String,
    },

    status: {
      type: String,
      enum: UPSCALE_STATUS,
      default: UPSCALE_STATUS.PENDING,
    },

    errorMessage: {
      type: String,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },

    upscaledPhotoId: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

upscaleSchema.index({ userId: 1, createdAt: -1 });
upscaleSchema.index({ status: 1 });

export const Upscale = mongoose.model<TUpscale>('Upscale', upscaleSchema);
