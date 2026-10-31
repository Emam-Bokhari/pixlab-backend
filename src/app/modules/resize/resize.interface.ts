import { HydratedDocument } from 'mongoose';
import { RESIZE_STATUS, RESIZE_FIT, RESIZE_CROP_STRATEGY } from './resize.constant';

export interface ImageDimensionInfo {
  widthPx: number;
  heightPx: number;
  sizeBytes: number;
  sizeKB: number;
  sizeMB: number;
  format: string;
}

export interface ResizeParams {
  width: number;
  height: number;
  fit: RESIZE_FIT;
  cropStrategy: RESIZE_CROP_STRATEGY;
}

export interface IResize {
  originalImage: string;
  resizedImage?: string;

  original?: ImageDimensionInfo;
  resized?: ImageDimensionInfo;
  resizeParams: ResizeParams;

  status: RESIZE_STATUS;
  errorMessage?: string;

  createdAt: Date;
  resizedPhotoId?: string;
}

export type ResizeDocument = HydratedDocument<IResize>;

export interface ResizeRequestInput {
  width: number;
  height: number;
}
