import { model, Schema } from 'mongoose';
import { TCreditSetting } from './creditSetting.interface';

const creditSettingSchema = new Schema<TCreditSetting>(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    credits: {
      type: Number,
      required: true,
      min: 0,
    },
    displayName: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const CreditSetting = model<TCreditSetting>('CreditSetting', creditSettingSchema);
