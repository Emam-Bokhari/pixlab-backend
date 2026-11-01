import path from 'path';
import { createLogger, format, transports } from 'winston';
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

export const logger = createLogger({
  level: 'info',
  format: combine(
    label({ label: 'APP' }),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    customFormat,
  ),
  transports: [
    new transports.Console({
      format: combine(colorize(), customFormat),
    }),
    new DailyRotateFile(fileTransportConfig('success', 'success')),
  ],
});

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
