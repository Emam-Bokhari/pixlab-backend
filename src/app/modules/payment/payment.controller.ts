import { Request, Response } from 'express';
import { PaymentServices } from './payment.service';
import { UDDOKTAPAY_CONFIG } from '../../config/uddoktapay';
import catchAsync from '../../shared/catchAsync';
import sendResponse from '../../shared/sendResponse';

// ---------------------------------------------------------------------
// POST /payments/uddoktapay/initiate
// Body: { amountBdt, fullName, email }
// Returns a checkoutUrl — frontend redirects the browser there.
// ---------------------------------------------------------------------
const initiateUddoktaPayPurchase = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const { amountBdt, fullName, email } = req.body;

  const result = await PaymentServices.initiateUddoktaPayPurchase(userId, {
    amountBdt,
    fullName,
    email,
  });

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Payment initiated successfully',
    data: result,
  });
});

// ---------------------------------------------------------------------
// GET /payments/uddoktapay/redirect?invoice_id=...
// This IS the automatic path: UddoktaPay redirects the user's browser
// here on its own after payment (return_type='GET' at initiation), so
// the user never types/pastes anything. We take the invoice_id from
// the query string, verify it server-to-server, apply credits, then
// bounce the browser to a frontend result page.
// ---------------------------------------------------------------------
const handleRedirect = catchAsync(async (req: Request, res: Response) => {
  const invoiceId = (req.query.invoice_id as string) || (req.body?.invoice_id as string);

  if (!invoiceId) {
    // TODO: point this at your actual frontend failure page
    return res.redirect('/payment/failed?reason=missing_invoice_id');
  }

  try {
    const payment = await PaymentServices.verifyByInvoiceId(invoiceId);
    // TODO: point these at your actual frontend result pages
    return res.redirect(`/payment/result?status=${payment.status}&paymentId=${payment._id}`);
  } catch (error: any) {
    return res.redirect(`/payment/failed?reason=${encodeURIComponent(error.message)}`);
  }
});

// ---------------------------------------------------------------------
// POST /payments/uddoktapay/webhook
// Supplementary path — per UddoktaPay's docs this only fires when an
// admin manually clicks "SEND WEBHOOK REQUEST" in their dashboard, so
// don't rely on this alone; the redirect handler above is the
// automatic one. Safe to receive here too since processing is idempotent.
// ---------------------------------------------------------------------
const handleWebhook = catchAsync(async (req: Request, res: Response) => {
  const headerApiKey = req.headers['rt-uddoktapay-api-key'] as string | undefined;

  // Checked here (not just inside the service) so a mismatch returns
  // a proper 401, matching UddoktaPay's own documented behavior.
  if (!headerApiKey || headerApiKey !== UDDOKTAPAY_CONFIG.apiKey) {
    return res.status(401).send('Unauthorized Action');
  }

  await PaymentServices.processWebhook(headerApiKey, req.body);

  // UddoktaPay just needs a 200 to consider the webhook delivered.
  res.status(200).send('Webhook received successfully');
});

// GET /payments/:paymentId — for the frontend to poll/display status
const getPaymentStatus = catchAsync(async (req: Request, res: Response) => {
  const { paymentId } = req.params;

  const result = await PaymentServices.getPaymentById(paymentId as string);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Payment fetched successfully',
    data: result,
  });
});

export const PaymentControllers = {
  initiateUddoktaPayPurchase,
  handleRedirect,
  handleWebhook,
  getPaymentStatus,
};
