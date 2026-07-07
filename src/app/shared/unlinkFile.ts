import fs from 'fs/promises';
import path from 'path';
import { HttpError } from '../errors/HttpError';

const UPLOAD_BASE_DIR = path.join(process.cwd(), 'uploads');

const unlinkFile = async (filePath: string): Promise<void> => {
  try {
    if (!filePath) return;

    // strip leading /uploads/ or uploads/ and any leading slashes
    const cleanPath = filePath
      .replace(/^(\/)?uploads\//, '') // remove uploads/ prefix
      .replace(/^\/+/, ''); // remove any leading slashes

    // use path.join instead of path.resolve to safely append to base dir
    const resolvedPath = path.join(UPLOAD_BASE_DIR, cleanPath);

    // ensure file is inside uploads directory
    if (!resolvedPath.startsWith(UPLOAD_BASE_DIR)) {
      throw new HttpError(400, 'Invalid file path');
    }

    try {
      await fs.access(resolvedPath);
    } catch {
      return; // file doesn't exist → ignore silently
    }

    await fs.unlink(resolvedPath);
  } catch (error: any) {
    if (error instanceof HttpError) throw error;

    console.error('File deletion failed:', error);
    throw new HttpError(500, error.message || 'Failed to delete file');
  }
};

export default unlinkFile;
