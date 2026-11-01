import { Router } from 'express';
import { BgRemoveControllers } from './bgRemove.controller';
import fileUploadHandler from '../../middlewares/fileUploadHandler';

const router = Router();

router.post('/', fileUploadHandler(), BgRemoveControllers.removeBg);

export const BgRemoveRoutes = router;
