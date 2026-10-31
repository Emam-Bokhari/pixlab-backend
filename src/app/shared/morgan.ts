import { Request, Response } from 'express';
import morgan from 'morgan';
import config from '../config';
import { errorLogger, logger } from './logger';

// common file transport config
const getIpFormat = () => (config.node_env === 'production' ? ':remote-addr - ' : '');
const formatString = `${getIpFormat()}:method :url :status :response-time ms - :res[content-length]`;

// success handler
const successHandler = morgan(formatString, {
  skip: (req: Request, res: Response) => res.statusCode >= 400,
  stream: { write: (message: string) => logger.info(message.trim()) },
});

// error handler
const errorHandler = morgan(formatString, {
  skip: (req: Request, res: Response) => res.statusCode < 400,
  stream: { write: (message: string) => errorLogger.error(message.trim()) },
});

export const Morgan = { successHandler, errorHandler };
