import mongoose from 'mongoose';
import QueryBuilder from '../../buiilder/QueryBuilder';
import { HttpError } from '../../errors/HttpError';
import { Message } from '../message/message.model';
import { User } from '../user/user.model';
import { Chat } from './chat.model';

const createChatToDB = async (userOne: string, userTwo: string) => {
  const participants = [userOne, userTwo].sort();

  const isExistChat = await Chat.findOne({
    participants: { $all: participants },
  });

  if (isExistChat) return isExistChat;

  const newChat = await Chat.create({
    participants,
  });

  // emit new chat to all participants
  //@ts-ignore
  const io = global.io;
  newChat.participants.forEach((participant) => {
    //@ts-ignore
    io.emit(`newChat::${participant._id}`, newChat);
  });

  if (!newChat) {
    throw new HttpError(400, 'Failed to create chat');
  }

  return newChat;
};

const getAllChatsFromDB = async (userId: string, query: Record<string, any>) => {
  const baseQuery: any = {
    participants: { $in: [userId] },
    deletedBy: { $ne: userId },
    isDeleted: { $ne: true },
  };

  // Search integration
  if (query.searchTerm) {
    const users = await User.find({
      $or: [
        { firstName: { $regex: query.searchTerm, $options: 'i' } },
        { lastName: { $regex: query.searchTerm, $options: 'i' } },
      ],
    }).select('_id');

    const userIds = users.map((u) => u._id);

    baseQuery.$and = [{ participants: { $in: [userId] } }, { participants: { $in: userIds } }];
  }

  // QueryBuilder usage
  const queryBuilder = new QueryBuilder(Chat.find(baseQuery), query)
    .sort()
    .paginate()
    .populate('lastMessage');

  const meta = await queryBuilder.countTotal();

  const chats = await queryBuilder.modelQuery.lean();

  //  enrichment (still N+1, later optimize)
  const enrichedChats = await Promise.all(
    chats.map(async (chat: any) => {
      const otherParticipantIds = chat.participants.filter((id: any) => id.toString() !== userId);

      const otherParticipants = await User.find({
        _id: { $in: otherParticipantIds },
      })
        .select('_id firstName lastName profileImage email role')
        .lean();

      const unreadCount = await Message.countDocuments({
        chatId: chat._id,
        sender: { $ne: userId },
        read: false,
        isDeleted: false,
      });

      return {
        ...chat,
        participants: otherParticipants,
        isRead: unreadCount === 0,
        unreadCount,
      };
    }),
  );

  return {
    data: enrichedChats,
    meta,
  };
};

const markChatAsRead = async (userId: string, chatId: string) => {
  return Chat.findByIdAndUpdate(chatId, { $addToSet: { readBy: userId } }, { new: true });
};

const softDeleteChatForUser = async (chatId: string, id: string) => {
  const userId = new mongoose.Types.ObjectId(id);
  const chat = await Chat.findById(chatId);
  if (!chat) {
    throw new HttpError(404, 'Chat not found');
  }

  if (!chat.participants.some((id) => id.toString() === userId.toString())) {
    throw new HttpError(401, 'User is not authorized');
  }

  // If already deleted by this user, just return
  if (chat.deletedBy.some((id) => id.toString() === userId.toString())) {
    return chat;
  }

  // Add userId to deletedBy array
  chat.deletedBy.push(userId);

  // Optional: If all participants deleted, mark status deleted (soft delete for everyone)
  if (chat.deletedBy.length === chat.participants.length) {
    chat.isDeleted = true;
  }

  await chat.save();

  //@ts-ignore
  const io = global.io;
  chat.participants.forEach((participant) => {
    //@ts-ignore
    io.emit(`chatDeletedForUser::${participant._id}`, { chatId, userId });
  });

  return chat;
};

export const ChatServices = {
  createChatToDB,
  getAllChatsFromDB,
  markChatAsRead,
  softDeleteChatForUser,
};
