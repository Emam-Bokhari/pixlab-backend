import { HydratedDocument, Types } from 'mongoose';
import { CREDIT_LEDGER_TYPE } from './creditLedger.constant';

export interface ICreditLedger {
  userId: Types.ObjectId;
  walletId: Types.ObjectId;

  type: CREDIT_LEDGER_TYPE;

  /** Positive for grants/purchases/refunds, negative for usage. */
  creditsDelta: number;

  /** wallet.credits value right after this entry was applied — makes
   * the ledger self-verifying (can replay and check it sums correctly). */
  balanceAfter: number;

  /** For PURCHASE entries: the raw amount (in poisha) this payment
   * contributed, before conversion into whole credits. */
  poishaDelta?: number;

  /** Cross-references — optional, only one is usually set depending on type. */
  relatedPaymentId?: Types.ObjectId;
  relatedPhotoId?: Types.ObjectId;

  note?: string;

  createdAt: Date;
}

export type CreditLedgerDocument = HydratedDocument<ICreditLedger>;
