import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { handleZodValidationError } from '../errors/handleZodValidationError';
import config from '../config';
import express from 'express';
import { TError } from '../interface/error';
import { HttpError } from '../errors/HttpError';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const globalErrorHandler = ((err: any, req: Request, res: Response, _next: NextFunction) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';

  let error: TError = [
    {
      path: '',
      message: '',
    },
  ];

  if (err instanceof ZodError) {
    const formattedZodError = handleZodValidationError(err);
    statusCode = formattedZodError?.statusCode;
    message = formattedZodError?.message;
    error = formattedZodError?.error;
  } else if (err instanceof HttpError) {
    statusCode = err?.statusCode;
    message = err?.message;
    error = [
      {
        path: '',
        message: err?.message,
      },
    ];
  } else if (err instanceof Error) {
    error = [
      {
        path: '',
        message: err?.message,
      },
    ];
  }

  return res.status(statusCode).json({
    success: false,
    message: message,
    statusCode,
    error,
    stack: config.node_env === 'development' ? err.stack : null,
  });
}) as unknown as express.ErrorRequestHandler;
