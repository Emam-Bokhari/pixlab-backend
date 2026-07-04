import { z } from 'zod';
import { USER_ROLE } from '../../types/enum';

const USER_ROLE_VALUES = Object.values(USER_ROLE) as [string, ...string[]];

export const userZodSchema = z.object({
  body: z.object({
    name: z.string({ message: 'Name is required' }).min(4, 'Name must be at least 4 characters'),

    profileImage: z.string().url('Invalid profile image URL').optional(),

    email: z
      .string({ message: 'Email is required' })
      .trim()
      .email({ message: 'Invalid email address' })
      .toLowerCase(),

    password: z
      .string({ message: 'Password is required' })
      .min(6, 'Password must be at least 6 characters')
      .max(100, 'Password is too long'),

    role: z
      .enum(USER_ROLE_VALUES, {
        message: `Invalid role. Allowed: ${Object.values(USER_ROLE).join(', ')}`,
      })
      .default(USER_ROLE.USER),

    isVerified: z.boolean().default(false),

    isActive: z.boolean().default(true),

    isDeleted: z.boolean().default(false),

    lastLoginAt: z.coerce.date().optional(),
  }),
});
