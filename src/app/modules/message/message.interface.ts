import { Types, Model } from 'mongoose';
import { MESSAGE_TYPE } from './message.constant';

export type TMessage = {
  chatId: Types.ObjectId;
  sender: Types.ObjectId;
  text: string;
  image?: string;
  isDeleted?: boolean;
  read?: boolean;
};

export type MessageModel = Model<TMessage>;
