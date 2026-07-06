import { HydratedDocument, Types } from 'mongoose';
import { PAYMENT_GATEWAY, PAYMENT_PURPOSE, PAYMENT_STATUS } from './payment.constant';


export interface IPayment {
  userId: Types.ObjectId;

  gateway: PAYMENT_GATEWAY;
  purpose: PAYMENT_PURPOSE;

  /** Amount actually paid, in poisha (integer — never a float). */
  amountPoisha: number;
  currency: string; // 'BDT'

  status: PAYMENT_STATUS;

  // ---- Gateway-agnostic references. Every gateway integration fills
  // these however it needs to; nothing here assumes UddoktaPay's shape,
  // so swapping/adding gateways never touches this interface. ----
  gatewayInvoiceId?: string; // id/reference returned when payment was initiated
  gatewayTransactionId?: string; // id returned once payment is settled/paid
  gatewayCheckoutUrl?: string; // redirect URL returned at initiation, if any
  /** Raw/extra gateway-specific payload, kept opaque on purpose. */
  gatewayMeta?: Record<string, any>;

  // ---- Snapshot of what this payment did to the wallet — filled in
  // once processed, for audit purposes. ----
  creditsAwarded?: number;
  leftoverPoishaBefore?: number;
  leftoverPoishaAfter?: number;

  failureReason?: string;

  createdAt: Date;
  updatedAt: Date;
}

export type PaymentDocument = HydratedDocument<IPayment>;