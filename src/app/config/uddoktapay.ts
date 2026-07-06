import config from ".";


/**
 * UddoktaPay sandbox credentials, straight from their docs
 * (https://uddoktapay.readme.io/reference/api-information) — used as
 * fallback defaults ONLY so the integration works out of the box in
 * sandbox. Add real values to your project config / .env before going
 * live:
 *
 *   UDDOKTAPAY_API_KEY=<your live/sandbox API key>
 *   UDDOKTAPAY_BASE_URL=https://sandbox.uddoktapay.com   (or your live domain)
 *   UDDOKTAPAY_REDIRECT_URL=<frontend page the user lands on after paying>
 *   UDDOKTAPAY_CANCEL_URL=<frontend page shown if user cancels>
 *   UDDOKTAPAY_WEBHOOK_URL=<your backend webhook endpoint, optional>
 */
export const UDDOKTAPAY_CONFIG = {
  apiKey: config.uddoktapay.api_key || '982d381360a69d419689740d9f2e26ce36fb7a50',
  baseUrl: config.uddoktapay.base_url || 'https://sandbox.uddoktapay.com',
  redirectUrl: config.uddoktapay.redirect_url as string | undefined,
  cancelUrl: config.uddoktapay.cancel_url as string | undefined,
  webhookUrl: config.uddoktapay.webhook_url as string | undefined,
};

export const UDDOKTAPAY_ENDPOINTS = {
  createCharge: `${UDDOKTAPAY_CONFIG.baseUrl}/api/checkout-v2`,
  verifyPayment: `${UDDOKTAPAY_CONFIG.baseUrl}/api/verify-payment`,
};