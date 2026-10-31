import { Types } from 'mongoose';
import { UPSCALE_STATUS } from './upscale.constant';

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

export interface TUpscale {
  userId: Types.ObjectId;
  originalImage: string;
  upscaledImage?: string;
  upscaledPhotoId?: string;

  original?: ImageDimensionInfo;
  upscaled?: ImageDimensionInfo;
  increase?: UpscaleIncreaseInfo;
  didUpscale?: boolean;
  warning?: string;

  status: UPSCALE_STATUS;
  errorMessage?: string;
  creditsUsed?: number;

  createdAt: Date;
}
