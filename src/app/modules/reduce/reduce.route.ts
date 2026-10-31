import { Router } from 'express';
import { ReduceControllers } from './reduce.controller';
import fileUploadHandler from '../../middlewares/fileUploadHandler';
import { parseFileData } from '../../middlewares/parseFileData';
import { validateRequestSchema } from '../../middlewares/validateRequestSchema';
import { ReduceValidations } from './reduce.validation';

const router = Router();

router.post(
  '/',
  fileUploadHandler(),
  parseFileData({
    fieldName: 'image',
    mode: 'single',
  }),
  validateRequestSchema(ReduceValidations.reduceImageZodSchema),
  ReduceControllers.reducePhoto,
);

router.get('/', ReduceControllers.getAllReducedImages);

export const ReduceRoutes = router;
