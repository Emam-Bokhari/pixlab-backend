import { model, Schema } from 'mongoose';
import { TContentPage } from './contentPage.interface';
import { CONTENT_PAGE_TYPE } from './contentPage.constant';

const contentSchema = new Schema<TContentPage>(
  {
    type: {
      type: String,
      enum: Object.values(CONTENT_PAGE_TYPE),
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const ContentPage = model('ContentPage', contentSchema);
