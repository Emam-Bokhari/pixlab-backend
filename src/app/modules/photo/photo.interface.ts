import { Types } from 'mongoose';
import { PAPER_SIZE, PHOTO_STATUS, PHOTO_TYPE } from './photo.constant';

export interface SizeInfo {
  name: string;
  mmWidth: number;
  mmHeight: number;
}

export interface PhotoInput {
  userId: Types.ObjectId;
  originalImage: string;
  country?: string;
  photoType: PHOTO_TYPE;

  sizeInfo: SizeInfo;

  bgColor?: string;
  copies?: 1 | 4 | 6 | 8;
  paperSize?: PAPER_SIZE;
}

export interface PhotoDocument extends PhotoInput {
  _id: string;
  idPhotoImage?: string;
  printLayoutImage?: string;
  status: PHOTO_STATUS;
  errorMessage?: string;
  creditsUsed?: number;
  isDownloaded: boolean;
  pngUrl: String;
  jpgUrl: String;
  webpUrl: String;
  createdAt: Date;
  expiresAt?: Date;
  printOptions: {
  paperSize: { type: String, default: 'A4' },
  marginMm: { type: Number, default: 5 },
  gapMm: { type: Number, default: 3 },
  columns: { type: Number },         
},
}
