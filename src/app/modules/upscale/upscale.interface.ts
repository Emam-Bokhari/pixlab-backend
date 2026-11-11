import { SendBinaryResponseOptions } from '../../shared/sendBinaryResponse';

export interface ImageDimensionInfo {
  format?: string | undefined;
  widthPx: number;
  heightPx: number;
  sizeBytes: number;
  sizeKB: number;
  sizeMB: number;
}

export interface ImageDimensionInfoWithData extends ImageDimensionInfo {
  format: string;
  imageUrl: string;
}

export interface UpscaleIncreaseInfo {
  widthPercent: number;
  heightPercent: number;
  sizeBytesPercent: number;
  sizeMBDiff: number;
}

export interface UpscaleResponseData {
  original: ImageDimensionInfoWithData;
  current: ImageDimensionInfoWithData;
  scale: number;
  increase: UpscaleIncreaseInfo;
}

export interface UpscaleResult {
  binary: SendBinaryResponseOptions;
  data: UpscaleResponseData;
}
