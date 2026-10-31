import { Router } from 'express';
import { ResizeControllers } from './resize.controller';
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
    ResizeControllers.resizePhoto,
  )
  .get(ResizeControllers.getAllResizes);

export const ResizeRoutes = router;
