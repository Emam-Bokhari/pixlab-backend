import { z } from 'zod';

const createFaqZodSchema = z.object({
  body: z.object({
    question: z.string().min(5, 'Question is too short').max(300, 'Question is too long').trim(),

    answer: z.string().min(10, 'Answer is too short').max(2000, 'Answer is too long').trim(),
  }),
});

const updateFaqZodSchema = z.object({
  body: z.object({
    question: z
      .string()
      .min(5, 'Question is too short')
      .max(300, 'Question is too long')
      .trim()
      .optional(),

    answer: z
      .string()
      .min(10, 'Answer is too short')
      .max(2000, 'Answer is too long')
      .trim()
      .optional(),
  }),
});

export const FaqValidationSchema = {
  createFaqZodSchema,
  updateFaqZodSchema,
};
