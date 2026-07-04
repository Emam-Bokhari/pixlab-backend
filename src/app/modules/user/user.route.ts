import express from 'express';
import { UserControllers } from './user.controller';
import { isAdmin, isAuthenticated } from '../../helpers/auth.helper';

const router = express.Router();

router.route('/').get(isAdmin, UserControllers.getAllUsers);

router
  .route('/:userId')
  .get(isAdmin, UserControllers.getUserById)
  .delete(isAdmin, UserControllers.deleteUserById);

router
  .route('/me/profile')
  .get(isAuthenticated, UserControllers.getMyProfile)
  .patch(isAuthenticated, UserControllers.updateProfile)
  .delete(isAuthenticated, UserControllers.deleteMyProfile);

router.route('/:userId/status').patch(isAdmin, UserControllers.updateUserStatus);

export const UserRoutes = router;
