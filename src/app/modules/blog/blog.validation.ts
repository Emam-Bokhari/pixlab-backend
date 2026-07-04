import { z } from 'zod';
import { BLOG_STATUS } from './blog.constant';

const createBlogZodSchema = z.object({
  body: z.object({
    title: z.string().trim().min(10, 'Title too short').max(200),

    content: z.string().min(50, 'Content too short'),

    excerpt: z.string().max(500).optional(),

    coverImage: z.string().optional(),

    tags: z.array(z.string().trim().min(2).max(30)).max(10, 'Too many tags').optional(),

    status: z
      .enum(Object.values(BLOG_STATUS), {
        message: 'Invalid status',
      })
      .optional(),

    isFeatured: z.boolean().optional(),
    readTime: z.number().optional(),
    publishedAt: z.date().optional(),
  }),
});

const updateBlogZodSchema = z.object({
  body: z.object({
    title: z.string().trim().min(10, 'Title too short').max(200).optional(),

    content: z.string().min(50, 'Content too short').optional(),

    excerpt: z.string().max(500).optional(),

    coverImage: z.string().optional(),

    tags: z.array(z.string().trim().min(2).max(30)).max(10, 'Too many tags').optional(),

    status: z
      .enum(Object.values(BLOG_STATUS), {
        message: 'Invalid status',
      })
      .optional(),

    isFeatured: z.boolean().optional(),
    readTime: z.number().optional(),
    publishedAt: z.date().optional(),
  }),
});

export const BlogValidationSchema = {
  createBlogZodSchema,
  updateBlogZodSchema,
};
