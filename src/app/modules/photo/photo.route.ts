import { Router } from 'express';
import { PhotoControllers } from './photo.controller';
import { isAuthenticated } from '../../helpers/auth.helper';
import fileUploadHandler from '../../middlewares/fileUploadHandler';
import { parseFileData } from '../../middlewares/parseFileData';
import { requireCredits } from '../../middlewares/creditCheck.middleware';

const router = Router();

router.route('/').post(
  isAuthenticated,
  requireCredits('photo_resize'),
  fileUploadHandler(),
  parseFileData({
    fieldName: 'originalImage',
    mode: 'single',
  }),PhotoControllers.createPhoto,
).get(
  isAuthenticated,
  PhotoControllers.getAllPhotos,
);

router.post('/:photoId/print-layout', isAuthenticated, PhotoControllers.generatePrintLayout);

router.post('/:photoId/convert', isAuthenticated, PhotoControllers.convertPrintLayout);

router.post('/:photoId/pdf', isAuthenticated, PhotoControllers.generatePdf);

router.patch('/:photoId/regenerate', isAuthenticated, PhotoControllers.regeneratePrintLayout);

export const PhotoRoutes = router;