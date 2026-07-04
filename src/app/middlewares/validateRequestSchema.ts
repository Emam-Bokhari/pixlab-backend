import { NextFunction, Request, Response } from 'express';
import { ZodType } from 'zod';

export const validateRequestSchema = (schema: ZodType) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
      });
      return next();
    } catch (err) {
      next(err);
    }
  };
};
