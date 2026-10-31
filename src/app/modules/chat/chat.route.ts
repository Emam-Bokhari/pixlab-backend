import express from 'express';
import { ChatControllers } from './chat.controller';
import { isAuthenticated } from '../../helpers/auth.helper';

const router = express.Router();

router
  .route('/')
  .post(isAuthenticated, ChatControllers.createChat)
  .get(isAuthenticated, ChatControllers.getAllChats);

router.route('/:chatId/read').patch(isAuthenticated, ChatControllers.markChatAsRead);

router.route('/:chatId').delete(isAuthenticated, ChatControllers.deleteChatForUser);

export const ChatRoutes = router;
