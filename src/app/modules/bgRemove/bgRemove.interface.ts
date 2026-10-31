import { HydratedDocument } from 'mongoose';
import { BG_REMOVE_STATUS } from './bgRemove.constant';

export interface IBgRemove {
  /** Path/URL of the originally uploaded image */
  originalImage: string;

  /** Path/URL of the background-removed result, set once processing succeeds */
  processedImage?: string | undefined;

  /** 6-digit hex, e.g. "FFFFFF". Omitted = transparent-background PNG. */
  bgColor?: string | undefined;

  status: BG_REMOVE_STATUS;
  errorMessage?: string | undefined;

  createdAt: Date;
  updatedAt: Date;

  bgRemovePhotoId?: string;
}

/**
 * The hydrated Mongoose document type — what BgRemove.findById(), etc.
 * actually return at runtime (includes .save(), ._id, etc).
 */
export type BgRemoveDocument = HydratedDocument<IBgRemove>;