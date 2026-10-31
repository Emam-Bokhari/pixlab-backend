import { z } from 'zod';
import { SUPPORT_STATUS } from './support.constant';
import { objectIdSchema } from '../../utils/objectIdSchema';

const SUPPORT_STATUS_VALUES = Object.values(SUPPORT_STATUS) as [string, ...string[]];

const createSupportZodSchema = z.object({
  body: z.object({
    name: z
      .string({ message: 'Name is required' })
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name is too long'),

    email: z
      .string({ message: 'Email is required' })
      .email({ message: 'Invalid email format' })
      .toLowerCase(),

    subject: z
      .string({ message: 'Subject is required' })
      .min(5, 'Subject must be at least 5 characters')
      .max(150, 'Subject is too long'),

    message: z
      .string({ message: 'Message is required' })
      .min(10, 'Message must be at least 10 characters')
      .max(2000, 'Message is too long'),

    userId: objectIdSchema.optional(),

    status: z
      .enum(SUPPORT_STATUS_VALUES, {
        message: `Invalid status. Allowed values: ${Object.values(SUPPORT_STATUS).join(', ')}`,
      })
      .default(SUPPORT_STATUS.OPEN),

    isDeleted: z.boolean().default(false),
  }),
});

export const SupportValidationSchema = {
  createSupportZodSchema,
};
