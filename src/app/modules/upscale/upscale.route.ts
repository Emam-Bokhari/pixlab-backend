import { Router } from 'express';
import { UpscaleControllers } from './upscale.controller';
import fileUploadHandler from '../../middlewares/fileUploadHandler';
import { parseFileData } from '../../middlewares/parseFileData';

const router = Router();

router
  .route('/')
  .post(
    fileUploadHandler(),
    parseFileData({
      fieldName: 'image',
      mode: 'single',
    }),
    UpscaleControllers.upscalePhoto,
  )
  .get(UpscaleControllers.getAllUpscales);

export const UpscaleRoutes = router;
