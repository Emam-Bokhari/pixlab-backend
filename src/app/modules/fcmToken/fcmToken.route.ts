import express from 'express';
import { isAuthenticated } from '../../helpers/auth.helper';
import { FcmTokenControllers } from './fcmToken.controller';

const router = express.Router();

router.post('/', isAuthenticated, FcmTokenControllers.createDeviceToken);

export const FcmTokenRoutes = router;
