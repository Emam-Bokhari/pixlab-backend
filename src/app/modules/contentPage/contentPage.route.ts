import { Router } from 'express';
import { ContentPageControllers } from './contentPage.controller';
import { isAdmin } from '../../helpers/auth.helper';

const router = Router();

router.post('/', isAdmin, ContentPageControllers.createContentPage);

router
  .route('/:type')
  .get(ContentPageControllers.getContentPageByType)
  .patch(ContentPageControllers.updateContentPageByType)
  .delete(ContentPageControllers.deleteContentPageByType);

export const ContentPageRoutes = router;
