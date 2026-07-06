import mongoose, { Schema, model } from "mongoose";
import { IUpscale } from "./upscale.interface";

const imageDimensionInfoSchema = new Schema(
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
  }
);

const upscaleIncreaseInfoSchema = new Schema(
  {
    widthPercent: {
      type: Number,
      required: true,
    },
    heightPercent: {
      type: Number,
      required: true,
    },
    sizeBytesPercent: {
      type: Number,
      required: true,
    },
    sizeMBDiff: {
      type: Number,
      required: true,
    },
  },
  {
    _id: false,
  }
);

const upscaleSchema = new Schema<IUpscale>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    originalImage: {
      type: String,
      required: true,
      trim: true,
    },

    upscaledImageUrl: {
      type: String,
      required: true,
      trim: true,
    },

    original: {
      type: imageDimensionInfoSchema,
      required: true,
    },

    upscaled: {
      type: imageDimensionInfoSchema,
      required: true,
    },

    increase: {
      type: upscaleIncreaseInfoSchema,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

upscaleSchema.index({ userId: 1, createdAt: -1 });

export const Upscale = model<IUpscale>('Upscale', upscaleSchema);
