import { PHOTO_TYPE } from '../photo.constant';

/** Every calculation in this module is DPI-based. Never hardcode pixels. */
export const DPI = 300;

export const MM_PER_INCH = 25.4;

/** Bump this whenever template geometry or rendering logic changes. */
export const RENDER_VERSION = 'studio-layout-v1';

export const DEFAULT_MARGIN_MM: Record<PHOTO_TYPE, number> = {
  [PHOTO_TYPE.PASSPORT]: 5,
  [PHOTO_TYPE.NID]: 5,
  [PHOTO_TYPE.VISA]: 5,
  [PHOTO_TYPE.STAMP]: 4,
  [PHOTO_TYPE.CUSTOM]: 5,
};

export const DEFAULT_GAP_MM: Record<PHOTO_TYPE, number> = {
  [PHOTO_TYPE.PASSPORT]: 4,
  [PHOTO_TYPE.NID]: 4,
  [PHOTO_TYPE.VISA]: 4,
  [PHOTO_TYPE.STAMP]: 3,
  [PHOTO_TYPE.CUSTOM]: 4,
};
