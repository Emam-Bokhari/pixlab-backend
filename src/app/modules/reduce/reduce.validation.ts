import { z } from 'zod';

const reduceImageZodSchema = z.object({
  body: z.object({
    targetSizeKb: z.preprocess(
      (val) => Number(val),
      z.number().positive('Target size must be a positive number')
    ),
  }),
});

export const ReduceValidations = {
  reduceImageZodSchema,
};
