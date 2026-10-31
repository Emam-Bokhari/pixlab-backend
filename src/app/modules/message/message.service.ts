import { HttpError } from '../../errors/HttpError';
import { Chat } from '../chat/chat.model';
import { TMessage } from './message.interface';
import { Message } from './message.model';

const sendMessageToDB = async (payload: TMessage): Promise<TMessage> => {
  const { chatId, sender } = payload;

  // 1. get chat + validate participant
  const chat = await Chat.findById(chatId);

  console.log(chat, 'chat');

  if (!chat) {
    throw new HttpError(404, 'Chat not found');
  }

  const isSenderParticipant = chat.participants.some(
    (p: any) => p.toString() === sender.toString(),
  );

  if (!isSenderParticipant) {
    throw new HttpError(403, 'Sender is not a participant in this chat');
  }

  // 2. create message
  const message = await Message.create({
    ...payload,
    read: false,
    isDeleted: false,
  });

  // 3. update chat
  await Chat.findByIdAndUpdate(chatId, {
    lastMessage: message._id,
    readBy: [sender.toString()],
    updatedAt: new Date(),
  });

  // 4. populate message (IMPORTANT FIX)
  const populatedMessage = await Message.findById(message._id)
    .populate('sender', 'firstName lastName profileImage role email')
    .lean();

  // 5. populate chat (for chat list)
  const populatedChat = await Chat.findById(chatId)
    .populate('participants', 'firstName lastName profileImage role email')
    .populate('lastMessage')
    .lean();

  // 6. socket
  //@ts-ignore
  const io = global.io;

  if (io) {
    const senderId = sender.toString();

    const receivers = chat.participants.filter((p: any) => p.toString() !== senderId);

    receivers.forEach((receiverId: any) => {
      const id = receiverId.toString();

      io.emit(`newMessage::${id}`, populatedMessage);

      io.emit(`unreadCountUpdate::${id}`, {
        chatId,
        action: 'increment',
      });

      io.emit(`chatListUpdate::${id}`, {
        chatId,
        chat: populatedChat,
        action: 'moveToTop',
        lastMessage: populatedMessage,
        updatedAt: new Date(),
      });
    });

    io.emit(`chatListUpdate::${senderId}`, {
      chatId,
      chat: populatedChat,
      action: 'moveToTop',
      lastMessage: populatedMessage,
      updatedAt: new Date(),
    });
  }

  return populatedMessage as TMessage;
};

const getMessagesFromDB = async (
  chatId: string,
  userId: string,
  query: Record<string, unknown>,
) => {
  console.log(chatId, userId, query);
  const page = Math.max(parseInt(String(query.page || '1'), 10), 1);
  const limit = Math.min(Math.max(parseInt(String(query.limit || '20'), 10), 1), 50);

  const skip = (page - 1) * limit;

  const [messages, total] = await Promise.all([
    Message.find({ chatId })
      .select('chatId sender text createdAt read')
      .populate('sender', 'firstName lastName profileImage role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),

    Message.countDocuments({ chatId }),

    Message.find({
      chatId,
    })
      .select('chatId sender text')
      .populate('sender', 'firstName lastName profileImage role')
      .sort({ pinnedAt: -1 })
      .lean(),
  ]);

  // collect unread messages safely
  const unreadIds: string[] = [];

  for (const msg of messages) {
    const senderId =
      typeof msg.sender === 'string' ? msg.sender : (msg.sender as any)?._id?.toString();

    if (senderId !== userId && !msg.read) {
      unreadIds.push(msg._id.toString());
    }
  }

  if (unreadIds.length) {
    await Message.updateMany(
      { _id: { $in: unreadIds } },
      {
        $set: {
          read: true,
          readAt: new Date(),
        },
      },
    );
  }

  return {
    messages,
    pagination: {
      total,
      page,
      limit,
      totalPage: Math.ceil(total / limit),
    },
  };
};

const deleteMessageFromDB = async (userId: string, messageId: string) => {
  // atomic update + authorization check in ONE query
  const message = await Message.findOneAndUpdate(
    {
      _id: messageId,
      sender: userId, // ensures only owner can delete
    },
    {
      $set: {
        isDeleted: true,
        isPinned: false,
      },
      $unset: {
        pinnedBy: '',
        pinnedAt: '',
      },
    },
    { new: true },
  ).lean();

  if (!message) {
    throw new HttpError(404, 'Message not found or unauthorized');
  }

  // clean chat sync (no condition needed, safe)
  await Chat.updateOne(
    { _id: message.chatId },
    {
      $pull: { pinnedMessages: messageId },
    },
  );

  return message;
};

export const MessageServices = {
  sendMessageToDB,
  getMessagesFromDB,
  deleteMessageFromDB,
};
