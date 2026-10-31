import { z } from 'zod';
import { objectIdSchema } from '../../utils/objectIdSchema';
import { NOTIFICATION_REFERENCE_MODEL, NOTIFICATION_TYPE } from './notification.constant';

const createNotificationZodSchema = z.object({
  body: z.object({
    title: z.string().min(3).max(200),

    body: z.string().min(5).max(1000),

    receiver: objectIdSchema,

    sender: objectIdSchema.optional(),

    type: z.enum(Object.values(NOTIFICATION_TYPE) as [string, ...string[]], {
      message: 'Invalid notification type',
    }),

    referenceId: objectIdSchema.optional(),

    referenceModel: z
      .enum(Object.values(NOTIFICATION_REFERENCE_MODEL) as [string, ...string[]], {
        message: 'Invalid reference model',
      })
      .optional(),

    metadata: z.record(z.string(), z.any()).optional(),
  }),
});

export const NotificationValidationSchema = {
  createNotificationZodSchema,
};
