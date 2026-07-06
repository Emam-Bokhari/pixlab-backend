import { Types } from 'mongoose';
import { Wallet } from './wallet.model';
import { WalletDocument } from './wallet.interface';
import { CREDIT_PRICE_POISHA, FREE_SIGNUP_CREDITS } from './wallet.constant';
import { CreditLedger } from '../creditLedger/creditLedger.model';
import { CREDIT_LEDGER_TYPE } from '../creditLedger/creditLedger.constant';

export class InsufficientCreditsError extends Error {
  constructor() {
    super('Insufficient credits');
    this.name = 'InsufficientCreditsError';
  }
}

/**
 * Gets the user's wallet, creating it (with the one-time free signup
 * bonus) if this is their first time. Safe to call repeatedly — the
 * free bonus is only ever granted once (hasClaimedFreeCredits).
 */
const getOrCreateWallet = async (userId: string | Types.ObjectId): Promise<WalletDocument> => {
  let wallet = await Wallet.findOne({ userId });
  if (wallet) return wallet;

  wallet = new Wallet({
    userId,
    credits: FREE_SIGNUP_CREDITS,
    balancePoisha: 0,
    hasClaimedFreeCredits: true,
    freeCreditsGrantedAt: new Date(),
  });
  await wallet.save();

  await CreditLedger.create({
    userId,
    walletId: wallet._id,
    type: CREDIT_LEDGER_TYPE.FREE_SIGNUP_BONUS,
    creditsDelta: FREE_SIGNUP_CREDITS,
    balanceAfter: wallet.credits,
    note: 'One-time free signup bonus',
  });

  return wallet;
};

const getWalletSummary = async (userId: string | Types.ObjectId) => {
  const wallet = await getOrCreateWallet(userId);
  return {
    credits: wallet.credits,
    balancePoisha: wallet.balancePoisha,
  };
};

const getCreditHistory = async (userId: string | Types.ObjectId, limit = 50) => {
  return CreditLedger.find({ userId }).sort({ createdAt: -1 }).limit(limit);
};

/**
 * Applies a successful payment to the user's wallet: adds the paid
 * amount to any leftover balance, converts as many whole credits out
 * of that as possible, and keeps the remainder as leftover for next
 * time. Writes one PURCHASE ledger entry.
 *
 * Idempotency is the CALLER's responsibility (payment.service.ts) —
 * this function should only ever be invoked once per successful
 * payment; call it from inside the same status-transition guard that
 * flips Payment.status to SUCCESS.
 */
const applyPurchaseToWallet = async (
  userId: string | Types.ObjectId,
  paymentId: Types.ObjectId,
  amountPoisha: number
): Promise<{ creditsAwarded: number; leftoverPoishaBefore: number; leftoverPoishaAfter: number }> => {
  const wallet = await getOrCreateWallet(userId);

  const leftoverPoishaBefore = wallet.balancePoisha;
  const totalPoisha = leftoverPoishaBefore + amountPoisha;

  const creditsAwarded = Math.floor(totalPoisha / CREDIT_PRICE_POISHA);
  const leftoverPoishaAfter = totalPoisha % CREDIT_PRICE_POISHA;

  wallet.credits += creditsAwarded;
  wallet.balancePoisha = leftoverPoishaAfter;
  wallet.lifetimeCreditsPurchased += creditsAwarded;
  wallet.lifetimePoishaPaid += amountPoisha;
  await wallet.save();

  await CreditLedger.create({
    userId,
    walletId: wallet._id,
    type: CREDIT_LEDGER_TYPE.PURCHASE,
    creditsDelta: creditsAwarded,
    balanceAfter: wallet.credits,
    poishaDelta: amountPoisha,
    relatedPaymentId: paymentId,
    note: `Payment applied: +${amountPoisha} poisha (leftover before: ${leftoverPoishaBefore})`,
  });

  return { creditsAwarded, leftoverPoishaBefore, leftoverPoishaAfter };
};

/**
 * Deducts exactly 1 credit for a photo conversion. Call this the
 * moment you're about to make the (paid) Cutout Pro API call — not
 * before any earlier validation, and not after — so a credit is only
 * ever spent when that external call actually happens, per the
 * product requirement.
 *
 * Throws InsufficientCreditsError (no deduction happens) if the
 * wallet doesn't have at least 1 credit.
 */
const deductCreditForPhotoUsage = async (
  userId: string | Types.ObjectId,
  photoId: Types.ObjectId | string
): Promise<void> => {
  const wallet = await getOrCreateWallet(userId);

  if (wallet.credits < 1) {
    throw new InsufficientCreditsError();
  }

  wallet.credits -= 1;
  wallet.lifetimeCreditsUsed += 1;
  await wallet.save();

  await CreditLedger.create({
    userId,
    walletId: wallet._id,
    type: CREDIT_LEDGER_TYPE.USAGE,
    creditsDelta: -1,
    balanceAfter: wallet.credits,
    relatedPhotoId: photoId,
    note: 'Cutout Pro conversion',
  });
};

/**
 * Refunds exactly 1 credit for a photo, e.g. if you decide later that
 * a failed downstream step should give the credit back. Not called
 * automatically anywhere — wire it in only where your business rules
 * call for a refund.
 */
const refundCreditForPhotoUsage = async (
  userId: string | Types.ObjectId,
  photoId: Types.ObjectId | string,
  note?: string
): Promise<void> => {
  const wallet = await getOrCreateWallet(userId);

  wallet.credits += 1;
  await wallet.save();

  await CreditLedger.create({
    userId,
    walletId: wallet._id,
    type: CREDIT_LEDGER_TYPE.REFUND,
    creditsDelta: 1,
    balanceAfter: wallet.credits,
    relatedPhotoId: photoId,
    note: note || 'Refund',
  });
};

export const WalletServices = {
  getOrCreateWallet,
  getWalletSummary,
  getCreditHistory,
  applyPurchaseToWallet,
  deductCreditForPhotoUsage,
  refundCreditForPhotoUsage,
};