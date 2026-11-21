import { Request, Response } from 'express';

export interface ImageDimensionMeta {
  widthPx: number;
  heightPx: number;
  sizeBytes: number;
  sizeKB: number;
  sizeMB: number;
  format?: string | undefined;
}

export interface SendBinaryResponseOptions {
  buffer: Buffer;
  filename: string;
  contentType: string;
  original?: ImageDimensionMeta | undefined;
  processed?: ImageDimensionMeta | undefined;
  processedPrefix?: string | undefined;
  extraHeaders?: Record<string, string | number | undefined> | undefined;
}

export const isBinaryRequested = (req: Request): boolean => {
  return req.query?.type === 'binary' || req.query?.download === 'true';
};

export const getMimeType = (format?: string, fallback = 'image/jpeg'): string => {
  if (!format) return fallback;
  const f = format.toLowerCase().replace(/^\./, '');
  if (f === 'jpg' || f === 'jpeg') return 'image/jpeg';
  if (f === 'png') return 'image/png';
  if (f === 'webp') return 'image/webp';
  if (f === 'avif') return 'image/avif';
  if (f === 'tiff') return 'image/tiff';
  if (f === 'gif') return 'image/gif';
  if (f === 'bmp') return 'image/bmp';
  return fallback;
};

export const getFileExtension = (format?: string, fallback = 'png'): string => {
  if (!format) return fallback;
  const f = format.toLowerCase().replace(/^\./, '');
  if (f === 'jpeg') return 'jpg';
  return f;
};

export const bufferToBase64Url = (buffer: Buffer, mimeType: string): string => {
  return `data:${mimeType};base64,${buffer.toString('base64')}`;
};

export const sendBinaryResponse = (res: Response, options: SendBinaryResponseOptions): void => {
  const {
    buffer,
    filename,
    contentType,
    original,
    processed,
    processedPrefix = 'Current',
    extraHeaders,
  } = options;

  const headers: Record<string, string> = {
    'Content-Type': contentType,
    'Content-Disposition': `attachment; filename="${filename}"`,
    'Content-Length': buffer.length.toString(),
  };

  const exposedHeaders: string[] = [];

  if (original) {
    headers['X-Original-Width'] = original.widthPx.toString();
    headers['X-Original-Height'] = original.heightPx.toString();
    headers['X-Original-Size-KB'] = original.sizeKB.toString();
    headers['X-Original-Size-MB'] = original.sizeMB.toString();
    exposedHeaders.push(
      'X-Original-Width',
      'X-Original-Height',
      'X-Original-Size-KB',
      'X-Original-Size-MB',
    );
  }

  if (processed) {
    const prefix = processedPrefix || 'Current';
    headers[`X-${prefix}-Width`] = processed.widthPx.toString();
    headers[`X-${prefix}-Height`] = processed.heightPx.toString();
    headers[`X-${prefix}-Size-KB`] = processed.sizeKB.toString();
    headers[`X-${prefix}-Size-MB`] = processed.sizeMB.toString();
    exposedHeaders.push(
      `X-${prefix}-Width`,
      `X-${prefix}-Height`,
      `X-${prefix}-Size-KB`,
      `X-${prefix}-Size-MB`,
    );
  }

  if (extraHeaders) {
    for (const [key, val] of Object.entries(extraHeaders)) {
      if (val !== undefined && val !== null) {
        headers[key] = val.toString();
        exposedHeaders.push(key);
      }
    }
  }

  if (exposedHeaders.length > 0) {
    headers['Access-Control-Expose-Headers'] = exposedHeaders.join(', ');
  }

  res.set(headers);
  res.send(buffer);
};
