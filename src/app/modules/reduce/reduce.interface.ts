import { HydratedDocument, Types } from 'mongoose';

export interface ImageSizeInfo {
  widthPx: number;
  heightPx: number;
  sizeBytes: number;
  sizeKB: number;
  sizeMB: number;
}

export interface IReduce {
  userId: Types.ObjectId;
  originalImageName: string;
  reducedImageUrl: string;
  original: ImageSizeInfo;
  reduced: ImageSizeInfo;
  reductionPercentage: number; // e.g. 75.50
  targetSizeKb: number;
  format: string; // jpeg, png, webp, etc.
  createdAt?: Date;
  updatedAt?: Date;
}

export type ReduceDocument = HydratedDocument<IReduce>;
