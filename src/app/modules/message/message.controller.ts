import catchAsync from '../../shared/catchAsync';
import sendResponse from '../../shared/sendResponse';
import { MessageServices } from './message.service';

const sendMessage = catchAsync(async (req, res) => {
  const { id: userId } = req.user as { id: string };
  console.log(userId);
  const payload = {
    ...req.body,
    sender: userId,
  };

  const result = await MessageServices.sendMessageToDB(payload);

  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: 'Message sent successfully',
    data: result,
  });
});

const getMessages = catchAsync(async (req, res) => {
  const { chatId } = req.params as { chatId: string };
  const { id: userId } = req.user as { id: string };

  const result = await MessageServices.getMessagesFromDB(chatId, userId, req.query);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Messages retrieved successfully',
    data: result,
  });
});

const deleteMessage = catchAsync(async (req, res) => {
  const { messageId } = req.params as { messageId: string };
  const { id: userId } = req.user as { id: string };

  const result = await MessageServices.deleteMessageFromDB(userId, messageId);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Message deleted successfully',
    data: result,
  });
});

export const MessageControllers = {
  sendMessage,
  getMessages,
  deleteMessage,
};
