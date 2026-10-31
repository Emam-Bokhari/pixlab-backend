import { Schema, model } from 'mongoose';
import { ChatModel, TChat } from './chat.interface';
import { softDeletePlugin } from '../../DB/plugins/softDelete.plugin';

const chatSchema = new Schema<TChat, ChatModel>(
  {
    participants: {
      type: [Schema.Types.ObjectId],
      ref: 'User',
      required: true,
      validate: {
        validator: (val: any[]) => val.length === 2,
        message: 'Chat must have exactly 2 participants',
      },
    },

    lastMessage: {
      type: Schema.Types.ObjectId,
      ref: 'Message',
      default: null, // chat create time no message
    },

    lastMessageAt: {
      type: Date,
      default: null,
      index: true,
    },

    readBy: {
      type: [Schema.Types.ObjectId],
      ref: 'User',
      default: [],
    },

    deletedBy: {
      type: [Schema.Types.ObjectId],
      ref: 'User',
      default: [],
    },

    isDeleted: {
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

// prevent duplicate chat between same 2 users
chatSchema.index({ participants: 1 }, { unique: true });

chatSchema.index({ lastMessageAt: -1 });

chatSchema.plugin(softDeletePlugin);

export const Chat = model<TChat, ChatModel>('Chat', chatSchema);
