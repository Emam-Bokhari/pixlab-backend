export interface ImageDimensionInfo {
  format?: string;
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

export interface UpscaleResult {
  buffer: Buffer;
  format: string;
  scale: number;
  original: ImageDimensionInfo;
  upscaled: ImageDimensionInfo;
  increase: UpscaleIncreaseInfo;
}

export interface UpscaleResponseData {
  original: ImageDimensionInfoWithData;
  current: ImageDimensionInfoWithData;
  scale: number;
  increase: UpscaleIncreaseInfo;
}
