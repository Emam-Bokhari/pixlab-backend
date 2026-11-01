import { Request } from 'express';
import multer, { FileFilterCallback } from 'multer';
import { HttpError } from '../errors/HttpError';

const ALLOWED_IMAGE_MIME_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'image/bmp',
  'image/tiff',
  'image/gif',
  'image/avif',
]);

const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  if (!file.mimetype || !ALLOWED_IMAGE_MIME_TYPES.has(file.mimetype)) {
    return cb(
      new HttpError(
        400,
        `Invalid file type: ${file.mimetype}. Allowed: PNG, JPEG, WEBP, BMP, TIFF, GIF, AVIF`,
      ),
    );
  }
  cb(null, true);
};

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max
  },
});

const fileUploadHandler = () => {
  return upload.single('image');
};

export default fileUploadHandler;
