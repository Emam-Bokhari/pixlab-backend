import { HydratedDocument, Types } from 'mongoose';

export interface IWallet {
  userId: Types.ObjectId;

  /** Whole, usable credits — 1 credit = 1 Cutout Pro conversion. */
  credits: number;

  /**
   * Leftover money (in poisha) that hasn't converted into a whole
   * credit yet. E.g. paying 20 BDT (2000 poisha) at 999 poisha/credit
   * gives 2 credits + 2 poisha leftover, stored here until a future
   * payment combines with it to cross the next 999-poisha threshold.
   */
  balancePoisha: number;

  /** Prevents granting the free signup bonus more than once. */
  hasClaimedFreeCredits: boolean;
  freeCreditsGrantedAt?: Date;

  /** Running totals, for analytics/support — not used for balance math. */
  lifetimeCreditsPurchased: number;
  lifetimeCreditsUsed: number;
  lifetimePoishaPaid: number;

  createdAt: Date;
  updatedAt: Date;
}

/**
 * The hydrated Mongoose document type — what Wallet.findOne(), etc.
 * actually return at runtime (includes .save(), ._id, etc).
 */
export type WalletDocument = HydratedDocument<IWallet>;
