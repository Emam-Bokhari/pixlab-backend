import mongoose, { Schema } from 'mongoose';
import { PHOTO_STATUS, PHOTO_TYPE } from './photo.constant';
import { PhotoDocument } from './photo.interface';


const photoSchema = new Schema<PhotoDocument>(
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

    country: {
      type: String,
      default: 'Bangladesh',
    },

    photoType: {
      type: String,
      enum: PHOTO_TYPE,
      required: true,
    },

    sizeInfo: {
      name: {
        type: String,
        required: true,
      },
      mmWidth: {
        type: Number,
        required: true,
      },
      mmHeight: {
        type: Number,
        required: true,
      },
    },

    bgColor: {
      type: String,
      default: 'FFFFFF',
    },

    copies: {
      type: Number,
      default: 1,
      enum: [1, 4, 6, 8],
    },

    // Cutout Pro Response
    idPhotoImage: {
      type: String,
    },
    printLayoutImage: {
      type: String,
    },

    status: {
      type: String,
      enum: PHOTO_STATUS,
      default: PHOTO_STATUS.PENDING,
    },

    errorMessage: {
      type: String,
    },

    creditsUsed: {
      type: Number,
    },

    isDownloaded: {
      type: Boolean,
      default: false,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },

    expiresAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

photoSchema.index({ userId: 1, createdAt: -1 });
photoSchema.index({ status: 1 });

export const Photo = mongoose.model<PhotoDocument>('Photo', photoSchema);

