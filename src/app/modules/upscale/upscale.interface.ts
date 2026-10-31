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
  originalImage: string;
  upscaledImage?: string;
  upscaledPhotoId?: string;

  original?: ImageDimensionInfo;
  upscaled?: ImageDimensionInfo;
  increase?: UpscaleIncreaseInfo;
  scale?: number;
  didUpscale?: boolean;

  status: UPSCALE_STATUS;
  errorMessage?: string;

  createdAt: Date;
}
