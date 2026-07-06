import { Router } from 'express';
import { PaymentControllers } from './payment.controller';
import { isAuthenticated } from '../../helpers/auth.helper';

const router = Router();

// Requires login — who is buying credits
router.post('/uddoktapay/initiate', isAuthenticated, PaymentControllers.initiateUddoktaPayPurchase);

// Public — UddoktaPay's own server/browser calls these, no user auth
router.get('/uddoktapay/redirect', PaymentControllers.handleRedirect);
router.post('/uddoktapay/redirect', PaymentControllers.handleRedirect); // in case return_type is ever switched to POST
router.post('/uddoktapay/webhook', PaymentControllers.handleWebhook);

router.get('/:paymentId', isAuthenticated, PaymentControllers.getPaymentStatus);

export const PaymentRoutes = router;