import catchAsync from '../../shared/catchAsync';
import sendResponse from '../../shared/sendResponse';
import { ChatServices } from './chat.service';

const createChat = catchAsync(async (req, res) => {
  const { id: userId } = req.user as { id: string };
  const { participantId } = req.body;

  const result = await ChatServices.createChatToDB(userId, participantId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Chat created successfully',
    data: result,
  });
});

const getAllChats = catchAsync(async (req, res) => {
  const { id: userId } = req.user as { id: string };

  const result = await ChatServices.getAllChatsFromDB(userId, req.query);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Chats retrieved successfully',
    data: result.data,
    meta: result.meta,
  });
});

const markChatAsRead = catchAsync(async (req, res) => {
  const { id: userId } = req.user as { id: string };
  const { chatId } = req.params as { chatId: string };

  const result = await ChatServices.markChatAsRead(userId, chatId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Chat marked as read',
    data: result,
  });
});

const deleteChatForUser = catchAsync(async (req, res) => {
  const { id: userId } = req.user as { id: string };
  const { chatId } = req.params as { chatId: string };

  const result = await ChatServices.softDeleteChatForUser(chatId, userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Chat deleted for user',
    data: result,
  });
});

export const ChatControllers = {
  createChat,
  getAllChats,
  markChatAsRead,
  deleteChatForUser,
};
