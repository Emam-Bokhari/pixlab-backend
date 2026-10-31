export const sendRealtimeNotification = (
  userIds: string | string[],
  payload: {
    title: string;
    body: string;
    type?: string;
    data?: Record<string, any>;
  },
) => {
  //@ts-ignore
  const io = global.io;
  if (!io) return;

  const ids = Array.isArray(userIds) ? userIds : [userIds];

  for (const userId of ids) {
    io.emit(`send-notification::${userId}`, {
      title: payload.title,
      body: payload.body,
      type: payload.type || null,
      data: payload.data || {},
    });
  }
};
