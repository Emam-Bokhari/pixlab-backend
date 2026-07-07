import { SizeInfo } from './photo.interface';

export enum PHOTO_TYPE {
  NID = 'nid',
  PASSPORT = 'passport',
  STAMP = 'stamp',
  VISA = 'visa',
  CUSTOM = 'custom',
}

export enum PHOTO_STATUS {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SUCCESS = 'success',
  FAILED = 'failed',
}

export enum PAPER_SIZE {
  FOUR_R = '4R',
  FIVE_R = '5R',
  SIX_R = '6R',
  A_FOUR = 'A4',
}

export type CountryPhotoSizes = {
  [key in Exclude<PHOTO_TYPE, PHOTO_TYPE.CUSTOM>]: SizeInfo;
};

export type PhotoSizes = {
  [country: string]: CountryPhotoSizes;
};

export const photoSizes: PhotoSizes = {
  Bangladesh: {
    passport: {
      name: 'Passport Size',
      mmWidth: 35,
      mmHeight: 45,
    },
    nid: {
      name: 'NID / Smart Card',
      mmWidth: 35,
      mmHeight: 45,
    },
    stamp: {
      name: 'Stamp Size',
      mmWidth: 25,
      mmHeight: 35,
    },
    visa: {
      name: 'Visa Photo',
      mmWidth: 35,
      mmHeight: 45,
    },
  },
};
