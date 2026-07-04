import express from 'express';
import auth from '../../middlewares/auth';
import { MessageControllers } from './message.controller';
import { isAuthenticated } from '../../helpers/auth.helper';

const router = express.Router();

router.route('/').post(isAuthenticated, MessageControllers.sendMessage);

router.route('/chat/:chatId').get(isAuthenticated, MessageControllers.getMessages);

router.route('/:messageId').delete(isAuthenticated, MessageControllers.deleteMessage);

export const MessageRoutes = router;
