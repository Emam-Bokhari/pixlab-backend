import { Router } from 'express';
import { PhotoControllers } from './photo.controller';
import { isAuthenticated } from '../../helpers/auth.helper';
import fileUploadHandler from '../../middlewares/fileUploadHandler';
import { parseFileData } from '../../middlewares/parseFileData';

const router = Router();

router.route('/').post(
  isAuthenticated,
  fileUploadHandler(),
  parseFileData({
    fieldName: 'originalImage',
    mode: 'single',
  }),PhotoControllers.createPhoto,
);


router.post('/:photoId/print-layout', PhotoControllers.generatePrintLayout);

router.post('/:photoId/convert', PhotoControllers.convertPrintLayout);

router.post('/:photoId/pdf', PhotoControllers.generatePdf);



export const PhotoRoutes = router;