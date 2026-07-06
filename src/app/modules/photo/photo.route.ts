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

router.post('/:photoId/print-layout', isAuthenticated, PhotoControllers.generatePrintLayout);

router.post('/:photoId/convert', isAuthenticated, PhotoControllers.convertPrintLayout);

router.post('/:photoId/pdf', isAuthenticated, PhotoControllers.generatePdf);

router.patch('/:photoId/regenerate', isAuthenticated, PhotoControllers.regeneratePrintLayout);

export const PhotoRoutes = router;