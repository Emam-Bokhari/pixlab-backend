import { Router } from 'express';
import { ReduceControllers } from './reduce.controller';
import fileUploadHandler from '../../middlewares/fileUploadHandler';

const router = Router();

router.post('/', fileUploadHandler(), ReduceControllers.reducePhoto);

export const ReduceRoutes = router;
