import sharp from 'sharp';
import { HttpError } from '../../errors/HttpError';
import {
  bufferToBase64Url,
  getFileExtension,
  getMimeType,
} from '../../shared/sendBinaryResponse';
import { DEFAULT_CROP_STRATEGY, DEFAULT_RESIZE_FIT, RESIZE_LIMITS } from './resize.constant';
import {
  ImageDimensionInfoWithData,
  ResizeRequestInput,
  ResizeResult,
} from './resize.interface';
import { getImageDimensionInfo } from './resize.utils';

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

const performResize = async (
  buffer: Buffer,
  width: number,
  height: number,
): Promise<{ buffer: Buffer; format: string }> => {
  const metadata = await sharp(buffer).metadata();
  const detectedFormat = metadata.format as string | undefined;
  const format: string =
    detectedFormat && ALLOWED_FORMATS.includes(detectedFormat) ? detectedFormat : 'png';

  let pipeline = sharp(buffer).rotate().resize({
    width,
    height,
    fit: DEFAULT_RESIZE_FIT,
    position: DEFAULT_CROP_STRATEGY,
    kernel: sharp.kernel.lanczos3,
    withoutEnlargement: false,
  });

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
  file?: Express.Multer.File,
  input?: ResizeRequestInput,
): Promise<ResizeResult> => {
  if (!file || !file.buffer) {
    throw new HttpError(400, 'No image file provided');
  }

  const width = Number(input?.width);
  const height = Number(input?.height);

  if (!width || !height) {
    throw new HttpError(400, 'width and height are required');
  }

  const originalBuffer = file.buffer;
  const fileSizeMB = originalBuffer.length / (1024 * 1024);

  if (fileSizeMB > RESIZE_LIMITS.MAX_INPUT_FILE_SIZE_MB) {
    throw new HttpError(
      400,
      `Image exceeds max allowed size of ${RESIZE_LIMITS.MAX_INPUT_FILE_SIZE_MB}MB`,
    );
  }

  let metadata: sharp.Metadata;
  try {
    metadata = await sharp(originalBuffer).metadata();
    if (!metadata.format || !ALLOWED_FORMATS.includes(metadata.format.toLowerCase())) {
      throw new Error(`Unsupported image format. Allowed: ${ALLOWED_FORMATS.join(', ')}`);
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Invalid or unsupported image file';
    throw new HttpError(400, message);
  }

  validateTargetDimensions(width, height);

  const originalInfo = await getImageDimensionInfo(originalBuffer);
  const { buffer: resizedBuffer, format } = await performResize(
    originalBuffer,
    width,
    height,
  );
  const resizedInfo = await getImageDimensionInfo(resizedBuffer);

  const originalMime = file.mimetype || getMimeType(originalInfo.format);
  const resizedMime = getMimeType(format);
  const ext = getFileExtension(format);

  const originalData: ImageDimensionInfoWithData = {
    ...originalInfo,
    imageUrl: bufferToBase64Url(originalBuffer, originalMime),
  };

  const currentData: ImageDimensionInfoWithData = {
    ...resizedInfo,
    imageUrl: bufferToBase64Url(resizedBuffer, resizedMime),
  };

  return {
    binary: {
      buffer: resizedBuffer,
      filename: `resized.${ext}`,
      contentType: resizedMime,
      original: originalData,
      processed: currentData,
      processedPrefix: 'Resized',
    },
    data: {
      original: originalData,
      current: currentData,
    },
  };
};

export const ResizeServices = {
  resizeImage,
};
