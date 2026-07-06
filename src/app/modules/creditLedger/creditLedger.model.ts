import mongoose, { Schema } from 'mongoose';
import { CREDIT_LEDGER_TYPE } from './creditLedger.constant';
import { ICreditLedger } from './creditLedger.interface';

const creditLedgerSchema = new Schema<ICreditLedger>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    walletId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Wallet',
      required: true,
    },

    type: {
      type: String,
      enum: CREDIT_LEDGER_TYPE,
      required: true,
    },

    creditsDelta: {
      type: Number,
      required: true,
    },

    balanceAfter: {
      type: Number,
      required: true,
    },

    poishaDelta: {
      type: Number,
    },

    relatedPaymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment',
    },

    relatedPhotoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Photo',
    },

    note: {
      type: String,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

creditLedgerSchema.index({ userId: 1, createdAt: -1 });
creditLedgerSchema.index({ walletId: 1, createdAt: -1 });

export const CreditLedger = mongoose.model<ICreditLedger>('CreditLedger', creditLedgerSchema);
