import { HydratedDocument } from 'mongoose';
import { BG_REMOVE_STATUS } from './bgRemove.constant';

export interface IBgRemove {
  originalImage: string;
  processedImage?: string | undefined;
  bgColor?: string | undefined;
  status: BG_REMOVE_STATUS;
  errorMessage?: string | undefined;
  createdAt: Date;
  updatedAt: Date;
  bgRemovePhotoId?: string;
}

export type BgRemoveDocument = HydratedDocument<IBgRemove>;
