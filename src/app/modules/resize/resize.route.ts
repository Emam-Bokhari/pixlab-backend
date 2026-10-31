import { Router } from 'express';
import { ResizeControllers } from './resize.controller';
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
    ResizeControllers.resizePhoto,
  )
  .get(isAuthenticated, ResizeControllers.getAllResizes);

export const ResizeRoutes = router;
