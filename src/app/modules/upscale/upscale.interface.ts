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

export interface UpscaleResult {
  buffer: Buffer;
  format: string;
  scale: number;
  original: ImageDimensionInfo;
  upscaled: ImageDimensionInfo;
  increase: UpscaleIncreaseInfo;
}
