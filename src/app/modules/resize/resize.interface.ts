export interface ImageDimensionInfo {
  widthPx: number;
  heightPx: number;
  sizeBytes: number;
  sizeKB: number;
  sizeMB: number;
  format: string;
}

export interface ResizeRequestInput {
  width: number;
  height: number;
}

export interface ResizeResult {
  buffer: Buffer;
  format: string;
  original: ImageDimensionInfo;
  resized: ImageDimensionInfo;
}
