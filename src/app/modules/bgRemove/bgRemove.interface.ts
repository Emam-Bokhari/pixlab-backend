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

export interface BgRemoveResult {
  buffer: Buffer;
  bgColor?: string | undefined;
}

export interface BgRemoveResponseData {
  original: ImageDetailsWithData;
  current: ImageDetailsWithData;
  bgColor?: string | undefined;
}
