import { Types } from 'mongoose';
import { ISoftDeleteModel } from '../../types/softDelete.interface';

export type TChat = {
  participants: Types.ObjectId[];
  lastMessage: Types.ObjectId;
  lastMessageAt: Date;
  isDeleted: boolean;
  readBy: Types.ObjectId[];
  deletedBy: Types.ObjectId[];
};

export type ChatModel = ISoftDeleteModel<TChat>;
