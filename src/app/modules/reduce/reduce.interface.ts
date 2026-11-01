export interface ImageSizeInfo {
  widthPx: number;
  heightPx: number;
  sizeBytes: number;
  sizeKB: number;
  sizeMB: number;
}

export interface ReduceResult {
  buffer: Buffer;
  format: string;
  original: ImageSizeInfo;
  reduced: ImageSizeInfo;
  reductionPercentage: number;
  targetSizeKb: number;
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
