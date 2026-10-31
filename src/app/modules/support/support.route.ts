import { validateRequestSchema } from './../../middlewares/validateRequestSchema';
import express from 'express';
import { SupportControllers } from './support.controller';
import { SupportValidationSchema } from './support.validation';
import { USER_ROLE } from '../../types/enum';
import optionalAuth from '../../middlewares/optionalAuth';
import auth from '../../middlewares/auth';

const router = express.Router();

router
  .route('/')
  .post(
    optionalAuth(USER_ROLE.USER),
    validateRequestSchema(SupportValidationSchema.createSupportZodSchema),
    SupportControllers.createSupport,
  )
  .get(auth(USER_ROLE.SUPER_ADMIN, USER_ROLE.ADMIN), SupportControllers.getAllSupports);

router.patch(
  '/status/:supportId',
  auth(USER_ROLE.SUPER_ADMIN, USER_ROLE.ADMIN),
  SupportControllers.updateSupportStatusById,
);

router
  .route('/:supportId')
  .get(auth(USER_ROLE.SUPER_ADMIN, USER_ROLE.ADMIN), SupportControllers.getSupportById)
  .delete(auth(USER_ROLE.SUPER_ADMIN, USER_ROLE.ADMIN), SupportControllers.deleteSupportById);

export const SupportRoutes = router;
