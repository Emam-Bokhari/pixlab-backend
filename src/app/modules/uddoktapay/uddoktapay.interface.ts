/**
 * Types matching UddoktaPay's documented API shapes exactly:
 * https://uddoktapay.readme.io/reference/create-charge-api-guideline
 * https://uddoktapay.readme.io/reference/verify-payment-api-guideline
 */

export interface UddoktaPayCreateChargeRequest {
  full_name: string;
  email: string;
  /** UddoktaPay expects amount as a string, in BDT (not poisha). */
  amount: string;
  metadata: Record<string, string>;
  redirect_url: string;
  cancel_url: string;
  webhook_url?: string | undefined;
  return_type?: 'GET' | 'POST';
}

export interface UddoktaPayCreateChargeSuccess {
  status: true;
  message: string;
  payment_url: string;
}

export interface UddoktaPayCreateChargeError {
  status: false;
  message: string;
}

export type UddoktaPayCreateChargeResponse =
  | UddoktaPayCreateChargeSuccess
  | UddoktaPayCreateChargeError;

export type UddoktaPayPaymentStatus = 'COMPLETED' | 'PENDING' | 'ERROR';

/**
 * Shape returned by both:
 *  - POST /api/verify-payment (server-to-server, using invoice_id)
 *  - the webhook/IPN payload (when an admin manually sends it)
 * They're documented as identical, so one type covers both.
 */
export interface UddoktaPayVerifyPaymentResponse {
  full_name: string;
  email: string;
  amount: string;
  fee: string;
  charged_amount: string;
  invoice_id: string;
  metadata: Record<string, string>;
  payment_method: string; // e.g. "bkash", "nagad", "rocket", "upay", "bank"
  sender_number: string;
  transaction_id: string;
  date: string;
  status: UddoktaPayPaymentStatus;
}

export interface UddoktaPayVerifyPaymentError {
  status: 'ERROR';
  message: string;
}
