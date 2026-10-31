import z from 'zod';

export const objectIdSchema = z.string({ message: 'ID is required' }).regex(/^[a-f\d]{24}$/i, {
  message: 'Invalid ObjectId format (must be 24 hex characters)',
});
