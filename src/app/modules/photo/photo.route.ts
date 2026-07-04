import express from 'express';
import { PhotoControllers } from './photo.controller';
import { isAuthenticated } from '../../helpers/auth.helper';
import fileUploadHandler from '../../middlewares/fileUploadHandler';
import { parseFileData } from '../../middlewares/parseFileData';

const router = express.Router();

router.route('/').post(
  isAuthenticated,
  fileUploadHandler(),
  parseFileData({
    fieldName: 'originalImage',
    mode: 'single',
  }),PhotoControllers.createPhoto,
);




export const PhotoRoutes = router;
