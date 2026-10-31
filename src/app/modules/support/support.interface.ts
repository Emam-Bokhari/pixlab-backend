import { Document, Types } from 'mongoose';
import { SUPPORT_STATUS } from './support.constant';

export type TSupport = {
  name: string;
  email: string;
  subject: string;
  message: string;
  status?: SUPPORT_STATUS;
  isDeleted?: boolean;
};

export interface SupportDocument extends TSupport, Document {
  _id: Types.ObjectId;
}
