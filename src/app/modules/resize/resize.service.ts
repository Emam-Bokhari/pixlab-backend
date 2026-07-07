import fs from 'fs';
import sharp from 'sharp';
import { Resize } from './resize.model';
import {
  RESIZE_STATUS,
  DEFAULT_RESIZE_FIT,
  DEFAULT_CROP_STRATEGY,
  RESIZE_LIMITS,
} from './resize.constant';
import { ResizeDocument, ResizeRequestInput } from './resize.interface';
import { getImageDimensionInfo, saveOriginalImage, saveResizedImage } from './resize.utils';
import { HttpError } from '../../errors/HttpError';

const ALLOWED_FORMATS = ['png', 'jpeg', 'jpg', 'webp', 'gif', 'tiff', 'avif'];

const validateTargetDimensions = (width: number, height: number) => {
  const { MIN_DIMENSION, MAX_DIMENSION } = RESIZE_LIMITS;

  if (
    !Number.isFinite(width) ||
    !Number.isFinite(height) ||
    !Number.isInteger(width) ||
    !Number.isInteger(height) ||
    width < MIN_DIMENSION ||
    height < MIN_DIMENSION
  ) {
    throw new HttpError(400, `width/height must be integers >= ${MIN_DIMENSION}px`);
  }

  if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
    throw new HttpError(400, `width/height must not exceed ${MAX_DIMENSION}px`);
  }
};

/**
 * fit/cropStrategy এখন আর বাইরে থেকে আসে না — সবসময় DEFAULT_RESIZE_FIT (cover)
 * আর DEFAULT_CROP_STRATEGY (attention) ব্যবহার হয়। এতে user শুধু width/height
 * দিয়েই কাজ চালাতে পারে, কোনো technical option নিয়ে confuse হতে হয় না।
 */
const performResize = async (
  buffer: Buffer,
  width: number,
  height: number,
): Promise<{ buffer: Buffer; format: string }> => {
  let pipeline = sharp(buffer).rotate().resize({
    width,
    height,
    fit: DEFAULT_RESIZE_FIT,
    position: DEFAULT_CROP_STRATEGY,
    kernel: sharp.kernel.lanczos3,
    withoutEnlargement: false,
  });

  const metadata = await sharp(buffer).metadata();
  const detectedFormat = metadata.format as string | undefined;
  const format: string =
    detectedFormat && ALLOWED_FORMATS.includes(detectedFormat) ? detectedFormat : 'png';

  switch (format) {
    case 'jpeg':
    case 'jpg':
      pipeline = pipeline.jpeg({ quality: 95, mozjpeg: true });
      break;
    case 'webp':
      pipeline = pipeline.webp({ quality: 95 });
      break;
    case 'avif':
      pipeline = pipeline.avif({ quality: 95 });
      break;
    case 'tiff':
      pipeline = pipeline.tiff({ quality: 95 });
      break;
    default:
      pipeline = pipeline.png({ quality: 100, compressionLevel: 9 });
      break;
  }

  const outputBuffer = await pipeline.toBuffer();
  return { buffer: outputBuffer, format };
};

const resizeImage = async (
  userId: string,
  input: ResizeRequestInput,
  file?: Express.Multer.File,
): Promise<ResizeDocument> => {
  if (!file) throw new HttpError(400, 'No file provided');

  if (input.width === undefined || input.height === undefined) {
    throw new HttpError(400, 'width and height are required');
  }

  let originalBuffer: Buffer;
  if (file.buffer) originalBuffer = file.buffer;
  else if (file.path) originalBuffer = fs.readFileSync(file.path);
  else throw new HttpError(400, 'File buffer not found');

  const fileSizeMB = originalBuffer.length / (1024 * 1024);
  if (fileSizeMB > RESIZE_LIMITS.MAX_INPUT_FILE_SIZE_MB) {
    throw new HttpError(
      400,
      `Image exceeds max allowed size of ${RESIZE_LIMITS.MAX_INPUT_FILE_SIZE_MB}MB`,
    );
  }

  try {
    const metadata = await sharp(originalBuffer).metadata();
    if (!metadata.format || !ALLOWED_FORMATS.includes(metadata.format.toLowerCase())) {
      throw new Error(`Unsupported image format. Allowed: ${ALLOWED_FORMATS.join(', ')}`);
    }
  } catch (err: any) {
    throw new HttpError(400, err.message || 'Invalid or unsupported image file');
  }

  const { width, height } = input;
  validateTargetDimensions(width, height);

  const originalImagePath = await saveOriginalImage(originalBuffer, userId);
  const originalInfo = await getImageDimensionInfo(originalBuffer);

  const resizeDoc = new Resize({
    userId,
    originalImage: originalImagePath,
    original: originalInfo,
    resizeParams: {
      width,
      height,
      fit: DEFAULT_RESIZE_FIT,
      cropStrategy: DEFAULT_CROP_STRATEGY,
    },
    status: RESIZE_STATUS.PENDING,
  });
  await resizeDoc.save();

  resizeDoc.status = RESIZE_STATUS.PROCESSING;
  await resizeDoc.save();

  try {
    const { buffer: resizedBuffer, format } = await performResize(originalBuffer, width, height);

    const resizedInfo = await getImageDimensionInfo(resizedBuffer);
    const resizedImageUrl = await saveResizedImage(resizedBuffer, userId, format);

    resizeDoc.resizedImage = resizedImageUrl;
    resizeDoc.resized = resizedInfo;
    resizeDoc.status = RESIZE_STATUS.SUCCESS;

    await resizeDoc.save();
    return resizeDoc;
  } catch (error: any) {
    resizeDoc.status = RESIZE_STATUS.FAILED;
    resizeDoc.errorMessage = error.message;
    await resizeDoc.save();
    throw new HttpError(500, error.message || 'Image resize failed');
  }
};

const getAllResizesForUser = async (userId: string) => {
  const resizes = await Resize.find({ userId }).sort({ createdAt: -1 }).exec();
  if (resizes.length === 0) {
    throw new HttpError(404, 'No resized images found for this user');
  }
  return resizes;
};

export const ResizeServices = {
  resizeImage,
  getAllResizesForUser,
};
