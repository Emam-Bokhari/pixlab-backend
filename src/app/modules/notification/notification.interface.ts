import { Model, Types } from 'mongoose';
import { NOTIFICATION_REFERENCE_MODEL, NOTIFICATION_TYPE } from './notification.constant';

export type INotification = {
  title: string;
  //unified naming (push + db same)
  body: string;
  receiver: Types.ObjectId;
  sender?: Types.ObjectId;
  type: NOTIFICATION_TYPE;
  read: boolean;
  readAt?: Date;
  referenceId?: Types.ObjectId;
  referenceModel?: NOTIFICATION_REFERENCE_MODEL;
  metadata?: Record<string, any>;
  createdAt?: Date;
  updatedAt?: Date;
};

export type NotificationModel = Model<INotification>;
