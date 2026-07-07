import { Router } from 'express';
import { UpscaleControllers } from './upscale.controller';
import { isAuthenticated } from '../../helpers/auth.helper';
import fileUploadHandler from '../../middlewares/fileUploadHandler';
import { parseFileData } from '../../middlewares/parseFileData';

const router = Router();

router
  .route('/')
  .post(
    isAuthenticated,
    fileUploadHandler(),
    parseFileData({
      fieldName: 'image',
      mode: 'single',
    }),
    UpscaleControllers.upscalePhoto,
  )
  .get(isAuthenticated, UpscaleControllers.getAllUpscales);

export const UpscaleRoutes = router;
