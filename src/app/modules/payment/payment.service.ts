import { Types } from 'mongoose';
import { Payment } from './payment.model';
import { PaymentDocument } from './payment.interface';
import { PAYMENT_GATEWAY, PAYMENT_PURPOSE, PAYMENT_STATUS } from './payment.constant';

import { UDDOKTAPAY_CONFIG } from '../../config/uddoktapay';

import { WalletServices } from '../wallet/wallet.service';

import { bdtToPoisha } from '../wallet/wallet.constant';
import { UddoktapayClient } from '../uddoktapay/uddoktapay.client';
import { UddoktaPayVerifyPaymentResponse } from '../uddoktapay/uddoktapay.interface';

const MIN_PURCHASE_BDT = 1;

// ---------------------------------------------------------------------
// Initiate a credit purchase via UddoktaPay's hosted checkout. Returns
// the checkout URL the frontend should redirect the browser to.
// ---------------------------------------------------------------------
const initiateUddoktaPayPurchase = async (
  userId: string,
  data: { amountBdt: number; fullName: string; email: string },
): Promise<{ paymentId: string; checkoutUrl: string }> => {
  const { amountBdt, fullName, email } = data;

  if (!amountBdt || amountBdt < MIN_PURCHASE_BDT) {
    throw new Error(`Minimum purchase amount is ${MIN_PURCHASE_BDT} BDT`);
  }
  if (!UDDOKTAPAY_CONFIG.redirectUrl || !UDDOKTAPAY_CONFIG.cancelUrl) {
    throw new Error('UDDOKTAPAY_REDIRECT_URL / UDDOKTAPAY_CANCEL_URL are not configured');
  }

  const amountPoisha = bdtToPoisha(amountBdt);

  const payment = await Payment.create({
    userId,
    gateway: PAYMENT_GATEWAY.UDDOKTAPAY,
    purpose: PAYMENT_PURPOSE.CREDIT_PURCHASE,
    amountPoisha,
    currency: 'BDT',
    status: PAYMENT_STATUS.PENDING,
  });

  // Our own Payment._id is passed as metadata — UddoktaPay echoes
  // metadata back on verify/webhook, which is how we correlate their
  // invoice_id back to OUR payment record (they never give us the
  // invoice_id at creation time, only after the user pays).
  const gatewayResponse = await UddoktapayClient.createCharge({
    full_name: fullName,
    email,
    amount: String(amountBdt),
    metadata: { paymentId: String(payment._id), userId: String(userId) },
    redirect_url: UDDOKTAPAY_CONFIG.redirectUrl,
    cancel_url: UDDOKTAPAY_CONFIG.cancelUrl,
    webhook_url: UDDOKTAPAY_CONFIG.webhookUrl,
    return_type: 'GET',
  });

  if (!gatewayResponse.status) {
    payment.status = PAYMENT_STATUS.FAILED;
    payment.failureReason = gatewayResponse.message;
    await payment.save();
    throw new Error(gatewayResponse.message || 'Failed to initiate payment');
  }

  payment.gatewayCheckoutUrl = gatewayResponse.payment_url;
  await payment.save();

  return { paymentId: String(payment._id), checkoutUrl: gatewayResponse.payment_url };
};

// ---------------------------------------------------------------------
// Shared processor — takes an already-fetched UddoktaPay payment
// result (from either the Verify Payment API call or the webhook
// payload, which are documented as identical shapes) and applies it.
// Idempotent: safe to call more than once for the same invoice_id.
// ---------------------------------------------------------------------
const processVerifiedResult = async (
  result: UddoktaPayVerifyPaymentResponse,
): Promise<PaymentDocument> => {
  const paymentId = result.metadata?.paymentId;
  if (!paymentId || !Types.ObjectId.isValid(paymentId)) {
    throw new Error('Payment result did not include a valid paymentId in metadata');
  }

  const payment = await Payment.findById(paymentId);
  if (!payment) {
    throw new Error(`Payment not found for id ${paymentId}`);
  }

  // Idempotency guard — already processed (e.g. redirect handler and
  // webhook both fired for the same payment). Do nothing the second time.
  if (payment.status === PAYMENT_STATUS.SUCCESS) {
    return payment;
  }

  payment.gatewayInvoiceId = result.invoice_id;
  payment.gatewayTransactionId = result.transaction_id;
  payment.gatewayMeta = result as unknown as Record<string, any>;

  if (result.status !== 'COMPLETED') {
    payment.status = result.status === 'ERROR' ? PAYMENT_STATUS.FAILED : PAYMENT_STATUS.PENDING;
    await payment.save();
    return payment;
  }

  // Trust OUR OWN stored amountPoisha (set at initiation) for the
  // actual credit math — not a value parsed back out of the gateway's
  // response string — so a tampered/odd response can't change how many
  // credits get awarded.
  const { creditsAwarded, leftoverPoishaBefore, leftoverPoishaAfter } =
    await WalletServices.applyPurchaseToWallet(
      payment.userId,
      payment._id as Types.ObjectId,
      payment.amountPoisha,
    );

  payment.status = PAYMENT_STATUS.SUCCESS;
  payment.creditsAwarded = creditsAwarded;
  payment.leftoverPoishaBefore = leftoverPoishaBefore;
  payment.leftoverPoishaAfter = leftoverPoishaAfter;
  await payment.save();

  return payment;
};

// ---------------------------------------------------------------------
// Called from the redirect handler (GET callback UddoktaPay sends the
// user's browser back to) — this is the AUTOMATIC path: the user does
// nothing but land back on your site, invoice_id arrives in the query
// string on its own, and this does a server-to-server verify call.
// ---------------------------------------------------------------------
const verifyByInvoiceId = async (invoiceId: string): Promise<PaymentDocument> => {
  const result = await UddoktapayClient.verifyPayment(invoiceId);

  if ((result as any).status === 'ERROR') {
    throw new Error((result as any).message || 'Payment verification failed');
  }

  return processVerifiedResult(result);
};

// ---------------------------------------------------------------------
// Called from the webhook endpoint. Per UddoktaPay's docs this only
// fires when an admin manually clicks "SEND WEBHOOK REQUEST" in their
// dashboard — so treat this as a supplementary/defense-in-depth path,
// not the primary confirmation mechanism (that's verifyByInvoiceId).
// ---------------------------------------------------------------------
const processWebhook = async (
  headerApiKey: string | undefined,
  payload: UddoktaPayVerifyPaymentResponse,
): Promise<PaymentDocument> => {
  if (!headerApiKey || headerApiKey !== UDDOKTAPAY_CONFIG.apiKey) {
    throw new Error('Unauthorized webhook: API key mismatch');
  }

  const invoiceId = payload.invoice_id;
  if (!invoiceId) {
    throw new Error('Webhook payload did not include an invoice_id');
  }

  return verifyByInvoiceId(invoiceId);
};

const getPaymentById = async (paymentId: string): Promise<PaymentDocument | null> => {
  return Payment.findById(paymentId);
};

export const PaymentServices = {
  initiateUddoktaPayPurchase,
  verifyByInvoiceId,
  processWebhook,
  getPaymentById,
};
