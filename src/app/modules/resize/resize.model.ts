import mongoose, { Schema } from 'mongoose';
import { RESIZE_STATUS, RESIZE_FIT, RESIZE_CROP_STRATEGY } from './resize.constant';
import { IResize } from './resize.interface';

const dimensionInfoSchema = new Schema(
  {
    widthPx: { type: Number, required: true },
    heightPx: { type: Number, required: true },
    sizeBytes: { type: Number, required: true },
    sizeKB: { type: Number, required: true },
    sizeMB: { type: Number, required: true },
    format: { type: String, required: true },
  },
  { _id: false },
);

const resizeParamsSchema = new Schema(
  {
    width: { type: Number, required: true },
    height: { type: Number, required: true },
    fit: { type: String, enum: RESIZE_FIT, required: true },
    cropStrategy: { type: String, enum: RESIZE_CROP_STRATEGY },
  },
  { _id: false },
);

const resizeSchema = new Schema<IResize>(
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

    resizedImage: {
      type: String,
    },

    original: {
      type: dimensionInfoSchema,
    },

    resized: {
      type: dimensionInfoSchema,
    },

    resizeParams: {
      type: resizeParamsSchema,
      required: true,
    },

    status: {
      type: String,
      enum: RESIZE_STATUS,
      default: RESIZE_STATUS.PENDING,
    },

    errorMessage: {
      type: String,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

resizeSchema.index({ userId: 1, createdAt: -1 });
resizeSchema.index({ status: 1 });

export const Resize = mongoose.model<IResize>('Resize', resizeSchema);