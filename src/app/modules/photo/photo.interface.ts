import { HydratedDocument, Types } from 'mongoose';
import { PAPER_SIZE, PHOTO_STATUS, PHOTO_TYPE } from './photo.constant';
import { Orientation } from './layouts/layouts.type';

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
  copies?: number;
  paperSize?: PAPER_SIZE;
}

export interface PrintOptions {
  paperSize: PAPER_SIZE;
  templateName: string;
  rows: number;
  columns: number;
  marginMm: number;
  gapMm: number;
  orientation: Orientation;
  dpi: number;
  renderVersion: string;
}

export interface IPhoto extends PhotoInput {
  idPhotoImage?: string | undefined;
  printLayoutImage?: string | undefined;
  status: PHOTO_STATUS;
  errorMessage?: string;
  creditsUsed?: number;
  isDownloaded: boolean;
  pngUrl: String;
  jpgUrl: String;
  webpUrl: String;
  pdfUrl: String;
  createdAt: Date;
  expiresAt?: Date;
  printOptions?: PrintOptions | undefined;
}

/**
 * The hydrated Mongoose document type — this is what Photo.findById(),
 * new Photo(...), etc. actually return at runtime, and it's what
 * carries .save(), .populate(), ._id, and every other Document method.
 * Always use PhotoDocument (not IPhoto) for anything that represents a
 * live document you're going to call .save() on.
 */
export type PhotoDocument = HydratedDocument<IPhoto>;