import { SendBinaryResponseOptions } from '../../shared/sendBinaryResponse';

export interface ImageDimensionInfo {
  widthPx: number;
  heightPx: number;
  sizeBytes: number;
  sizeKB: number;
  sizeMB: number;
  format: string;
}

export interface ImageDetailsWithData extends ImageDimensionInfo {
  imageUrl: string;
}

export interface BgRemoveResponseData {
  original: ImageDetailsWithData;
  current: ImageDetailsWithData;
  bgColor?: string | undefined;
}

export interface BgRemoveResult {
  binary: SendBinaryResponseOptions;
  data: BgRemoveResponseData;
}
