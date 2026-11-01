import express from 'express';
import { validateRequestSchema } from '../../middlewares/validateRequestSchema';
import { SupportControllers } from './support.controller';
import { SupportValidationSchema } from './support.validation';

const router = express.Router();

router.post(
  '/',
  validateRequestSchema(SupportValidationSchema.createSupportZodSchema),
  SupportControllers.createSupport,
);

export const SupportRoutes = router;
