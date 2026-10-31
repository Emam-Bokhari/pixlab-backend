export enum PAYMENT_GATEWAY {
  UDDOKTAPAY = 'uddoktapay',
  // Add new gateways here later, e.g.:
  // SSLCOMMERZ = 'sslcommerz',
  // STRIPE = 'stripe',
}

export enum PAYMENT_STATUS {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export enum PAYMENT_PURPOSE {
  CREDIT_PURCHASE = 'credit_purchase',
}
