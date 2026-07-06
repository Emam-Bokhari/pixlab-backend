import { z } from 'zod';

const createCreditSettingZodSchema = z.object({
  body: z.object({
    key: z.string().min(1, 'Key is required').trim(),
    credits: z.number().nonnegative('Credits must be a non-negative number'),
    displayName: z.string().min(1, 'Display name is required').trim(),
    description: z.string().trim().optional(),
  }),
});

const updateCreditSettingZodSchema = z.object({
  body: z.object({
    credits: z.number().nonnegative('Credits must be a non-negative number'),
  }),
});

export const CreditSettingValidations = {
  createCreditSettingZodSchema,
  updateCreditSettingZodSchema,
};
