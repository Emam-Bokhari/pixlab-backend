import { SendBinaryResponseOptions } from '../../shared/sendBinaryResponse';

export interface ImageDimensionInfo {
  widthPx: number;
  heightPx: number;
  sizeBytes: number;
  sizeKB: number;
  sizeMB: number;
  format: string;
}

export interface ImageDimensionInfoWithData extends ImageDimensionInfo {
  imageUrl: string;
}

export interface ResizeRequestInput {
  width: unknown;
  height: unknown;
}

export interface ResizeResponseData {
  original: ImageDimensionInfoWithData;
  current: ImageDimensionInfoWithData;
}

export interface ResizeResult {
  binary: SendBinaryResponseOptions;
  data: ResizeResponseData;
}
