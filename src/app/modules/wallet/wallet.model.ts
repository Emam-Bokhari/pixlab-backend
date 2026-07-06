import mongoose, { Schema } from 'mongoose';
import { IWallet } from './wallet.interface';

const walletSchema = new Schema<IWallet>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },

    credits: {
      type: Number,
      default: 0,
      min: 0,
    },

    balancePoisha: {
      type: Number,
      default: 0,
      min: 0,
    },

    hasClaimedFreeCredits: {
      type: Boolean,
      default: false,
    },

    freeCreditsGrantedAt: {
      type: Date,
    },

    lifetimeCreditsPurchased: {
      type: Number,
      default: 0,
    },

    lifetimeCreditsUsed: {
      type: Number,
      default: 0,
    },

    lifetimePoishaPaid: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

walletSchema.index({ userId: 1 }, { unique: true });

export const Wallet = mongoose.model<IWallet>('Wallet', walletSchema);