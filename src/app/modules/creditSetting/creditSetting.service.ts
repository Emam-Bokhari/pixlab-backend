import { HttpError } from '../../errors/HttpError';
import { TCreditSetting } from './creditSetting.interface';
import { CreditSetting } from './creditSetting.model';

const getCreditSettingsFromDB = async () => {
  const settings = await CreditSetting.find({});
  return settings;
};

const updateCreditSettingInDB = async (key: string, payload: { credits: number }) => {
  const updatedSetting = await CreditSetting.findOneAndUpdate(
    { key },
    { $set: { credits: payload.credits } },
    { new: true, runValidators: true }
  );

  if (!updatedSetting) {
    throw new HttpError(404, `Credit setting with key '${key}' not found`);
  }

  return updatedSetting;
};

const seedDefaultCreditSettings = async () => {
  const defaults: TCreditSetting[] = [
    {
      key: 'photo_resize',
      credits: 1,
      displayName: 'Photo Resize',
      description: 'Credit cost for photo resizing (passport size, etc.)',
    },
    {
      key: 'upscale',
      credits: 5,
      displayName: 'Photo Upscale',
      description: 'Credit cost for photo upscaling',
    },
    {
      key: 'clothes_change',
      credits: 2,
      displayName: 'Clothes Change',
      description: 'Credit cost for changing clothes/suits in photos',
    },
    {
      key: 'reduce',
      credits: 1,
      displayName: 'Photo Size Reduction',
      description: 'Credit cost for reducing photo file size (KB/MB)',
    },
  ];

  for (const item of defaults) {
    const exists = await CreditSetting.findOne({ key: item.key });
    if (!exists) {
      await CreditSetting.create(item);
      console.log(`[SEED] Created default credit setting: ${item.key}`);
    }
  }
};

export const CreditSettingServices = {
  getCreditSettingsFromDB,
  updateCreditSettingInDB,
  seedDefaultCreditSettings,
};
