import { Router } from 'express';
import { ResizeControllers } from './resize.controller';
import fileUploadHandler from '../../middlewares/fileUploadHandler';

const router = Router();

router.post('/', fileUploadHandler(), ResizeControllers.resizePhoto);

export const ResizeRoutes = router;
