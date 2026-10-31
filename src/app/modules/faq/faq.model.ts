import { model, Schema } from 'mongoose';
import { TFaq, FaqModel } from './faq.interface';
import { softDeletePlugin } from '../../DB/plugins/softDelete.plugin';

const faqSchema = new Schema<TFaq, FaqModel>(
  {
    question: {
      type: String,
      required: true,
    },
    answer: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

faqSchema.plugin(softDeletePlugin);

export const Faq = model<TFaq, FaqModel>('Faq', faqSchema);
