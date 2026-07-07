export enum RESIZE_STATUS {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SUCCESS = 'success',
  FAILED = 'failed',
}

// এগুলো এখন শুধু internal ব্যবহারের জন্য — user কে এসব option দেওয়া হয় না।
// Fixed decision: cover + attention, সবসময়। প্রয়োজন হলে ভবিষ্যতে
// এখান থেকেই বদলানো যাবে, কোনো user-facing param ছাড়াই।
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

// এই দুইটাই এখন app-wide fixed default — কোনো request-এ override করা যাবে না।
export const DEFAULT_RESIZE_FIT = RESIZE_FIT.COVER;
export const DEFAULT_CROP_STRATEGY = RESIZE_CROP_STRATEGY.ATTENTION;

export const RESIZE_LIMITS = {
  MIN_DIMENSION: 8,
  MAX_DIMENSION: 8000,
  MAX_INPUT_FILE_SIZE_MB: 25,
};
