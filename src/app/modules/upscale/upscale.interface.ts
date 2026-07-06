import { HydratedDocument, Types } from 'mongoose';

export interface ImageDimensionInfo {
  widthPx: number;
  heightPx: number;
  sizeBytes: number;
  sizeKB: number;
  sizeMB: number;
}

export interface UpscaleIncreaseInfo {
  widthPercent: number;
  heightPercent: number;
  sizeBytesPercent: number;
  sizeMBDiff: number;
}

export interface IUpscale {
  userId: Types.ObjectId;
  originalImage: string;
  upscaledImageUrl: string;
  original: ImageDimensionInfo;
  upscaled: ImageDimensionInfo;
  increase: UpscaleIncreaseInfo;
  createdAt?: Date;
  updatedAt?: Date;
}

export type UpscaleDocument = HydratedDocument<IUpscale>;