import { Router } from 'express';
import { BgRemoveControllers } from './bgRemove.controller';
import fileUploadHandler from '../../middlewares/fileUploadHandler';
import { parseFileData } from '../../middlewares/parseFileData';

const router = Router();

router.post(
  '/',
  fileUploadHandler(),
  parseFileData({
    fieldName: 'image',
    mode: 'single',
  }),
  BgRemoveControllers.createBgRemoveJob,
);

router.get('/', BgRemoveControllers.getMyBgRemoveJobs);
router.get('/:jobId', BgRemoveControllers.getBgRemoveJobById);

export const BgRemoveRoutes = router;
