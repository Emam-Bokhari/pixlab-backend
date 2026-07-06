import { Router } from 'express';
import { CreditSettingControllers } from './creditSetting.controller';
import { isAdmin } from '../../helpers/auth.helper';
import { validateRequestSchema } from '../../middlewares/validateRequestSchema';
import { CreditSettingValidations } from './creditSetting.validation';

const router = Router();

router.get('/', CreditSettingControllers.getCreditSettings);

router.patch(
  '/:key',
  isAdmin,
  validateRequestSchema(CreditSettingValidations.updateCreditSettingZodSchema),
  CreditSettingControllers.updateCreditSetting
);

export const CreditSettingRoutes = router;
