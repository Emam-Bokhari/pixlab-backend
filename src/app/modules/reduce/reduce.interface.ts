import { SendBinaryResponseOptions } from '../../shared/sendBinaryResponse';

export interface ImageSizeInfo {
  widthPx: number;
  heightPx: number;
  sizeBytes: number;
  sizeKB: number;
  sizeMB: number;
}

export interface ImageDetailsWithData extends ImageSizeInfo {
  format: string;
  imageUrl: string;
}

export interface ReduceResponseData {
  original: ImageDetailsWithData;
  current: ImageDetailsWithData;
  targetSizeKb: number;
  reductionPercentage: number;
}

export interface ReduceResult {
  binary: SendBinaryResponseOptions;
  data: ReduceResponseData;
}
