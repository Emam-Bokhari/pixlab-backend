import express from 'express';
import { AdminControllers } from './admin.controller';
import { isSuperAdmin } from '../../helpers/auth.helper';

const router = express.Router();

router
  .route('/')
  .post(isSuperAdmin, AdminControllers.createAdmin)
  .get(isSuperAdmin, AdminControllers.getAllAdmins);

router.delete('/:adminId', isSuperAdmin, AdminControllers.deleteAdmin);

export const AdminRoutes = router;
