import { Router } from 'express';
import { ReduceControllers } from './reduce.controller';
import { isAuthenticated } from '../../helpers/auth.helper';
import fileUploadHandler from '../../middlewares/fileUploadHandler';
import { parseFileData } from '../../middlewares/parseFileData';
import { validateRequestSchema } from '../../middlewares/validateRequestSchema';
import { ReduceValidations } from './reduce.validation';
import { requireCredits } from '../../middlewares/creditCheck.middleware';

const router = Router();

router.post(
  '/',
  isAuthenticated,
  // requireCredits('reduce'),
  fileUploadHandler(),
  parseFileData({
    fieldName: 'image',
    mode: 'single',
  }),
  validateRequestSchema(ReduceValidations.reduceImageZodSchema),
  ReduceControllers.reducePhoto
);

router.get(
  '/',
  isAuthenticated,
  ReduceControllers.getAllReducedImages
);

export const ReduceRoutes = router;
