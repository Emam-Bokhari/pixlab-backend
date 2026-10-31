import mongoose, { Schema, model } from 'mongoose';
import { IReduce } from './reduce.interface';

const imageSizeInfoSchema = new Schema(
  {
    widthPx: {
      type: Number,
      required: true,
    },
    heightPx: {
      type: Number,
      required: true,
    },
    sizeBytes: {
      type: Number,
      required: true,
    },
    sizeKB: {
      type: Number,
      required: true,
    },
    sizeMB: {
      type: Number,
      required: true,
    },
  },
  {
    _id: false,
  },
);

const reduceSchema = new Schema<IReduce>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    originalImageName: {
      type: String,
      required: true,
      trim: true,
    },
    reducedImageUrl: {
      type: String,
      required: true,
      trim: true,
    },
    original: {
      type: imageSizeInfoSchema,
      required: true,
    },
    reduced: {
      type: imageSizeInfoSchema,
      required: true,
    },
    reductionPercentage: {
      type: Number,
      required: true,
    },
    targetSizeKb: {
      type: Number,
      required: true,
    },
    format: {
      type: String,
      required: true,
      trim: true,
    },
    reducedPhotoId: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

reduceSchema.index({ userId: 1, createdAt: -1 });

export const Reduce = model<IReduce>('Reduce', reduceSchema);
