import mongoose from 'mongoose';
import { ITokenData } from './fcmToken.interface';
import { DeviceToken } from './fcmToken.model';

const createDeviceTokenToDB = async (
  userId: string | mongoose.Types.ObjectId,
  payload: ITokenData,
) => {
  await DeviceToken.deleteMany({
    fcmToken: payload.fcmToken,
    userId: { $ne: userId },
  });

  const result = await DeviceToken.findOneAndUpdate(
    {
      userId: userId,
      deviceId: payload.deviceId,
    },
    {
      $set: {
        fcmToken: payload.fcmToken,
        deviceType: payload.deviceType,
        updatedAt: new Date(),
      },
    },
    {
      upsert: true,
      new: true,
      runValidators: true,
    },
  );
  return result;
};

export const FcmTokenServices = {
  createDeviceTokenToDB,
};
