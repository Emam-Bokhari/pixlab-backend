import { Router } from 'express';
import { WalletControllers } from './wallet.controller';
import { isAuthenticated } from '../../helpers/auth.helper';
// TODO: wire in your actual auth middleware, e.g.:
// import auth from '../../middlewares/auth';

const router = Router();

router.get('/me', isAuthenticated, WalletControllers.getMyWallet);
router.get('/me/history', isAuthenticated, WalletControllers.getMyCreditHistory);

export const WalletRoutes = router;
