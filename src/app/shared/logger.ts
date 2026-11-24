import path from 'path';
import { createLogger, format, transports, transport } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const { combine, timestamp, label, printf, colorize } = format;

const customFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${label}] ${level}: ${message}`;
});

// file transport options for log rotation
const fileTransportConfig = (folder: string, type: string) => ({
  filename: path.join(process.cwd(), 'logs', 'winston', folder, `%DATE%-${type}.log`),
  datePattern: 'YYYY-MM-DD-HH',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d',
});

// Serverless environments (like Vercel and AWS Lambda) have a read-only filesystem (/var/task).
// Attempting to write files or create folders will throw EROFS.
// In serverless environments, Console transport is used so platform log drains capture stdout/stderr.
const isServerless =
  Boolean(process.env.VERCEL) ||
  Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME) ||
  Boolean(process.env.LAMBDA_TASK_ROOT);

const appTransports: transport[] = [
  new transports.Console({
    format: combine(colorize(), customFormat),
  }),
];

const appErrorTransports: transport[] = [
  new transports.Console({
    format: combine(colorize(), customFormat),
  }),
];

if (!isServerless) {
  appTransports.push(new DailyRotateFile(fileTransportConfig('success', 'success')));
  appErrorTransports.push(new DailyRotateFile(fileTransportConfig('error', 'error')));
}

export const logger = createLogger({
  level: 'info',
  format: combine(
    label({ label: 'APP' }),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    customFormat,
  ),
  transports: appTransports,
});

export const errorLogger = createLogger({
  level: 'error',
  format: combine(
    label({ label: 'APP-ERROR' }),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    customFormat,
  ),
  transports: appErrorTransports,
});
