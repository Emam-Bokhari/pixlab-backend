import { Router } from 'express';
import { UpscaleControllers } from './upscale.controller';
import fileUploadHandler from '../../middlewares/fileUploadHandler';

const router = Router();

router.post('/', fileUploadHandler(), UpscaleControllers.upscalePhoto);

export const UpscaleRoutes = router;
