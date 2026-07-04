import { Types } from "mongoose";
import { PHOTO_STATUS, PHOTO_TYPE } from "./photo.constant";

export interface SizeInfo {
  name: string;
  mmWidth: number;
  mmHeight: number;
}

export interface PhotoRequestInput {
  userId: Types.ObjectId;         
  originalImage: string;
  country?: string;
  photoType: PHOTO_TYPE;
  
  sizeInfo: SizeInfo;

  bgColor?: string;
  copies?: 1 | 4 | 6 | 8;
}

export interface PhotoRequestDocument extends PhotoRequestInput {
  _id: string;
  idPhotoImage?: string;
  printLayoutImage?: string;
  status: PHOTO_STATUS;
  errorMessage?: string;
  creditsUsed?: number;
  isDownloaded: boolean;
  createdAt: Date;
  expiresAt?: Date;
}