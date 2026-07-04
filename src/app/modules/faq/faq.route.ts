import { Router } from 'express';
import { FaqControllers } from './faq.controller';
import { isAdmin } from '../../helpers/auth.helper';
import { validateRequestSchema } from '../../middlewares/validateRequestSchema';
import { FaqValidationSchema } from './faq.validation';

const router = Router();

router
  .route('/')
  .post(
    isAdmin,
    validateRequestSchema(FaqValidationSchema.createFaqZodSchema),
    FaqControllers.createFaq,
  )
  .get(FaqControllers.getFaqs);

router.patch('/restore-all', isAdmin, FaqControllers.restoreAllFaqs);

router
  .route('/:faqId')
  .patch(
    isAdmin,
    validateRequestSchema(FaqValidationSchema.updateFaqZodSchema),
    FaqControllers.updateFaqById,
  )
  .delete(isAdmin, FaqControllers.deleteByIdFaq);

export const FaqRoutes = router;
