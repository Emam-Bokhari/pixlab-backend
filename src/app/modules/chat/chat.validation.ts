import { z } from 'zod';
import { objectIdSchema } from '../../utils/objectIdSchema';

export const createChatValidation = z.object({
  body: z.object({
    participants: z
      .array(objectIdSchema)
      .length(2, 'Chat must have exactly 2 participants')
      .refine((arr) => arr[0] !== arr[1], 'Participants must be different users'),
    lastMessage: objectIdSchema.optional(),
    lastMessageAt: z.date().optional(),
    readBy: z.array(objectIdSchema).optional(),
    isDeleted: z.boolean().optional().default(false),
  }),
});
