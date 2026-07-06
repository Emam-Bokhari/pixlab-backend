import mongoose, { Schema } from 'mongoose';
import { PAYMENT_GATEWAY, PAYMENT_PURPOSE, PAYMENT_STATUS } from './payment.constant';
import { IPayment } from './payment.interface';

const paymentSchema = new Schema<IPayment>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    gateway: {
      type: String,
      enum: PAYMENT_GATEWAY,
      required: true,
    },

    purpose: {
      type: String,
      enum: PAYMENT_PURPOSE,
      required: true,
    },

    amountPoisha: {
      type: Number,
      required: true,
      min: 1,
    },

    currency: {
      type: String,
      default: 'BDT',
    },

    status: {
      type: String,
      enum: PAYMENT_STATUS,
      default: PAYMENT_STATUS.PENDING,
    },

    gatewayInvoiceId: {
      type: String,
    },

    gatewayTransactionId: {
      type: String,
    },

    gatewayCheckoutUrl: {
      type: String,
    },

    gatewayMeta: {
      type: Schema.Types.Mixed,
    },

    creditsAwarded: {
      type: Number,
    },

    leftoverPoishaBefore: {
      type: Number,
    },

    leftoverPoishaAfter: {
      type: Number,
    },

    failureReason: {
      type: String,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

paymentSchema.index({ userId: 1, createdAt: -1 });
paymentSchema.index({ status: 1 });
// Only enforce uniqueness once the gateway assigns a real id — many
// pending/failed attempts can coexist with gatewayInvoiceId unset.
paymentSchema.index(
  { gateway: 1, gatewayInvoiceId: 1 },
  {
    unique: true,
    partialFilterExpression: { gatewayInvoiceId: { $exists: true, $gt: '' } },
  }
);
paymentSchema.index(
  { gateway: 1, gatewayTransactionId: 1 },
  {
    unique: true,
    partialFilterExpression: { gatewayTransactionId: { $exists: true, $gt: '' } },
  }
);

export const Payment = mongoose.model<IPayment>('Payment', paymentSchema);