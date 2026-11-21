import fs from 'fs/promises';
import path from 'path';
import { HttpError } from '../errors/HttpError';

import { errorLogger } from './logger';

const UPLOAD_BASE_DIR = path.join(process.cwd(), 'uploads');

const unlinkFile = async (filePath: string): Promise<void> => {
  try {
    if (!filePath) return;

    // normalize relative path by removing leading uploads prefix
    const cleanPath = filePath.replace(/^(\/)?uploads\//, '').replace(/^\/+/, '');

    const resolvedPath = path.join(UPLOAD_BASE_DIR, cleanPath);

    // prevent path traversal outside uploads directory
    if (!resolvedPath.startsWith(UPLOAD_BASE_DIR)) {
      throw new HttpError(400, 'Invalid file path');
    }

    try {
      await fs.access(resolvedPath);
    } catch {
      // skip silently if file does not exist
      return;
    }

    await fs.unlink(resolvedPath);
  } catch (error: unknown) {
    if (error instanceof HttpError) throw error;

    errorLogger.error('File deletion failed:', error);
    throw new HttpError(500, error instanceof Error ? error.message : 'Failed to delete file');
  }
};

export default unlinkFile;
