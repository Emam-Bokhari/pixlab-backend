import axios from 'axios';
import { UDDOKTAPAY_CONFIG, UDDOKTAPAY_ENDPOINTS } from '../../config/uddoktapay';
import { UddoktaPayCreateChargeRequest, UddoktaPayCreateChargeResponse, UddoktaPayVerifyPaymentResponse } from './uddoktapay.interface';


const headers = {
  'RT-UDDOKTAPAY-API-KEY': UDDOKTAPAY_CONFIG.apiKey,
  'Content-Type': 'application/json',
  Accept: 'application/json',
};

/**
 * Initiates a payment ("Create Charge"). Returns a payment_url the
 * user's browser should be redirected to (UddoktaPay's hosted
 * checkout page).
 */
export const createCharge = async (
  payload: UddoktaPayCreateChargeRequest
): Promise<UddoktaPayCreateChargeResponse> => {
  const response = await axios.post<UddoktaPayCreateChargeResponse>(
    UDDOKTAPAY_ENDPOINTS.createCharge,
    payload,
    { headers, timeout: 20000 }
  );
  return response.data;
};

/**
 * Server-to-server call to check the real status of a payment by its
 * invoice_id. This is the source of truth — never trust a client-side
 * "I paid!" claim without this call confirming status === 'COMPLETED'.
 */
export const verifyPayment = async (invoiceId: string): Promise<UddoktaPayVerifyPaymentResponse> => {
  const response = await axios.post<UddoktaPayVerifyPaymentResponse>(
    UDDOKTAPAY_ENDPOINTS.verifyPayment,
    { invoice_id: invoiceId },
    { headers, timeout: 20000 }
  );
  return response.data;
};

export const UddoktapayClient = {
  createCharge,
  verifyPayment,
};