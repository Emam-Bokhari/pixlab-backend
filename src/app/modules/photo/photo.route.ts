import { Router } from 'express';
import { PhotoControllers } from './photo.controller';
import fileUploadHandler from '../../middlewares/fileUploadHandler';
import { parseFileData } from '../../middlewares/parseFileData';

const router = Router();

router
  .route('/')
  .post(
    fileUploadHandler(),
    parseFileData({
      fieldName: 'originalImage',
      mode: 'single',
    }),
    PhotoControllers.createPhoto,
  )
  .get(PhotoControllers.getAllPhotos);

router.post('/:photoId/print-layout', PhotoControllers.generatePrintLayout);

router.post('/:photoId/convert', PhotoControllers.convertPrintLayout);

router.post('/:photoId/pdf', PhotoControllers.generatePdf);

router.patch('/:photoId/regenerate', PhotoControllers.regeneratePrintLayout);

export const PhotoRoutes = router;
