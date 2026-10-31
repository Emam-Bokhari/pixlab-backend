import { Schema, model } from 'mongoose';
import { INotification } from './notification.interface';
import { NOTIFICATION_REFERENCE_MODEL, NOTIFICATION_TYPE } from './notification.constant';
import { softDeletePlugin } from '../../DB/plugins/softDelete.plugin';

const notificationSchema = new Schema<INotification>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    //  unified naming (push + db same)
    body: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },

    receiver: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    readAt: {
      type: Date,
      default: null,
      index: true,
    },

    referenceId: {
      type: Schema.Types.ObjectId,
      default: null,
    },

    referenceModel: {
      type: String,
      enum: Object.values(NOTIFICATION_REFERENCE_MODEL),
      default: null,
    },

    type: {
      type: String,
      enum: Object.values(NOTIFICATION_TYPE),
      required: true,
      index: true,
    },

    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

notificationSchema.index({ receiver: 1, readAt: 1 });

notificationSchema.index({ receiver: 1, createdAt: -1 });

notificationSchema.index({ receiver: 1, type: 1 });

notificationSchema.index({ referenceId: 1, referenceModel: 1 });

notificationSchema.plugin(softDeletePlugin);

// ================= MODEL =================
export const NotificationModel = model<INotification>('Notification', notificationSchema);
