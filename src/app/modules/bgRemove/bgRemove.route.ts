import { Router } from 'express';
import { BgRemoveControllers } from './bgRemove.controller';
import fileUploadHandler from '../../middlewares/fileUploadHandler';
import { parseFileData } from '../../middlewares/parseFileData';
import { isAuthenticated } from '../../helpers/auth.helper';

const router = Router();

router.post(
  '/',
  isAuthenticated,
  fileUploadHandler(),
  parseFileData({
    fieldName: 'image',
    mode: 'single',
  }),
  BgRemoveControllers.createBgRemoveJob,
);
router.get('/me/history', isAuthenticated, BgRemoveControllers.getMyBgRemoveJobs);
router.get('/:jobId', isAuthenticated, BgRemoveControllers.getBgRemoveJobById);

export const BgRemoveRoutes = router;
