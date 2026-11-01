export enum RESIZE_STATUS {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SUCCESS = 'success',
  FAILED = 'failed',
}

// internal default configuration
export enum RESIZE_FIT {
  COVER = 'cover',
  FILL = 'fill',
  INSIDE = 'inside',
  OUTSIDE = 'outside',
}

export enum RESIZE_CROP_STRATEGY {
  CENTRE = 'centre',
  ATTENTION = 'attention',
  ENTROPY = 'entropy',
}

// app-wide fixed defaults
export const DEFAULT_RESIZE_FIT = RESIZE_FIT.COVER;
export const DEFAULT_CROP_STRATEGY = RESIZE_CROP_STRATEGY.ATTENTION;

export const RESIZE_LIMITS = {
  MIN_DIMENSION: 8,
  MAX_DIMENSION: 8000,
  MAX_INPUT_FILE_SIZE_MB: 25,
};
