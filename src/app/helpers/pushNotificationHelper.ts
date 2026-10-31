import { firebaseAdmin } from '../config/firebase';
import { DeviceToken } from '../modules/fcmToken/fcmToken.model';

export const sendPushNotification = async (
  userIds: string | string[],
  payload: {
    title: string;
    body: string;
    type: string;
    data?: Record<string, string>;
  },
) => {
  const ids = Array.isArray(userIds) ? userIds : [userIds];

  const tokensData = await DeviceToken.find({
    userId: { $in: ids },
    fcmToken: { $exists: true, $ne: '' },
  })
    .select('fcmToken')
    .lean();

  const tokens = tokensData.map((t) => t.fcmToken);
  if (!tokens.length) return;

  const BATCH_SIZE = 500;

  for (let i = 0; i < tokens.length; i += BATCH_SIZE) {
    const chunk = tokens.slice(i, i + BATCH_SIZE);

    await firebaseAdmin.messaging().sendEachForMulticast({
      tokens: chunk,
      notification: {
        title: payload.title,
        body: payload.body,
      },
      data: {
        ...(payload.data || {}),
        type: payload.type,
      },
    });
  }
};
