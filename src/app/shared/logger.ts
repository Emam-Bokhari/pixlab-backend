import path from 'path';
import { createLogger, format, transports } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const { combine, timestamp, label, printf, colorize } = format;

// custom log format
const customFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${label}] ${level}: ${message}`;
});

// common file transport config
const fileTransportConfig = (folder: string, type: string) => ({
  filename: path.join(process.cwd(), 'logs', 'winston', folder, `%DATE%-${type}.log`),
  datePattern: 'YYYY-MM-DD-HH',
  zippedArchive: true, // compress archived files
  maxSize: '20m',
  maxFiles: '14d', // 14 days of logs kept
});

// main logger (for logging success messages)
export const logger = createLogger({
  level: 'info',
  format: combine(
    label({ label: 'APP' }),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    customFormat,
  ),
  transports: [
    new transports.Console({
      format: combine(colorize(), customFormat), // terminal colorized output
    }),
    new DailyRotateFile(fileTransportConfig('success', 'success')),
  ],
});

// error logger (for logging errors)
export const errorLogger = createLogger({
  level: 'error',
  format: combine(
    label({ label: 'APP-ERROR' }),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    customFormat,
  ),
  transports: [
    new transports.Console({
      format: combine(colorize(), customFormat),
    }),
    new DailyRotateFile(fileTransportConfig('error', 'error')),
  ],
});
