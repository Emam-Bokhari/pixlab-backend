import { Schema, model } from 'mongoose';
import { TMessage } from './message.interface';
import { MESSAGE_TYPE } from './message.constant';
import { softDeletePlugin } from '../../DB/plugins/softDelete.plugin';

const messageSchema = new Schema<TMessage>(
  {
    chatId: {
      type: Schema.Types.ObjectId,
      ref: 'Chat',
      required: true,
      index: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    read: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// chat wise message sorting optimization
messageSchema.index({ chatId: 1, createdAt: -1 });

// sender filtering optimization
messageSchema.index({ sender: 1 });

messageSchema.plugin(softDeletePlugin);

export const Message = model<TMessage>('Message', messageSchema);
