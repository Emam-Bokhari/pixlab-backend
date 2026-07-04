import { ISoftDeleteModel } from '../../types/softDelete.interface';

export type TFaq = {
  question: string;
  answer: string;
};

export type FaqModel = ISoftDeleteModel<TFaq>;
