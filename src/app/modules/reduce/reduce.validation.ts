import { z } from 'zod';

const reduceImageZodSchema = z.object({
  body: z.object({
    targetSizeKb: z.preprocess(
      (val) => Number(val),
      z.number().positive('Target size must be a positive number'),
    ),
    image: z.string().min(1, 'Image path is required'),
  }),
});

export const ReduceValidations = {
  reduceImageZodSchema,
};
