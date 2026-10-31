import z from 'zod';
import { CONTENT_PAGE_TYPE } from './contentPage.constant';

export const contentPageZodSchema = z.object({
  body: z.object({
    type: z.enum(Object.values(CONTENT_PAGE_TYPE), {
      message: 'Invalid content page type',
    }),
    content: z.string().min(1, { message: 'Content page content is required' }),
  }),
});
