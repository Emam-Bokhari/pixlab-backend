import catchAsync from '../../shared/catchAsync';
import { ResizeServices } from './resize.service';
import { HttpError } from '../../errors/HttpError';
import sendResponse from '../../shared/sendResponse';
import { ResizeResponseData } from './resize.interface';

const resizePhoto = catchAsync(async (req, res) => {
  const file = req.file;

  if (!file) {
    throw new HttpError(400, 'No image file provided');
  }

  const width = Number(req.body?.width);
  const height = Number(req.body?.height);

  if (!width || !height) {
    throw new HttpError(400, 'width and height are required');
  }

  const result = await ResizeServices.resizeImage({ width, height }, file);

  const mimeType =
    result.format === 'jpeg' || result.format === 'jpg'
      ? 'image/jpeg'
      : result.format === 'webp'
      ? 'image/webp'
      : result.format === 'avif'
      ? 'image/avif'
      : result.format === 'tiff'
      ? 'image/tiff'
      : result.format === 'gif'
      ? 'image/gif'
      : 'image/png';

  const ext = result.format === 'jpeg' ? 'jpg' : result.format;

  if (req.query?.type === 'binary' || req.query?.download === 'true') {
    res.set({
      'Content-Type': mimeType,
      'Content-Disposition': `attachment; filename="resized.${ext}"`,
      'Content-Length': result.buffer.length.toString(),
      'X-Original-Width': result.original.widthPx.toString(),
      'X-Original-Height': result.original.heightPx.toString(),
      'X-Original-Size-KB': result.original.sizeKB.toString(),
      'X-Original-Size-MB': result.original.sizeMB.toString(),
      'X-Resized-Width': result.resized.widthPx.toString(),
      'X-Resized-Height': result.resized.heightPx.toString(),
      'X-Resized-Size-KB': result.resized.sizeKB.toString(),
      'X-Resized-Size-MB': result.resized.sizeMB.toString(),
      'Access-Control-Expose-Headers': [
        'X-Original-Width',
        'X-Original-Height',
        'X-Original-Size-KB',
        'X-Original-Size-MB',
        'X-Resized-Width',
        'X-Resized-Height',
        'X-Resized-Size-KB',
        'X-Resized-Size-MB',
      ].join(', '),
    });

    return res.send(result.buffer);
  }

  const originalMime = file.mimetype || 'image/jpeg';
  const originalBase64 = `data:${originalMime};base64,${file.buffer.toString('base64')}`;
  const currentBase64 = `data:${mimeType};base64,${result.buffer.toString('base64')}`;

  const originalData = {
    ...result.original,
    imageUrl: originalBase64,
  };

  const currentData = {
    ...result.resized,
    imageUrl: currentBase64,
  };

  const responseData: ResizeResponseData = {
    original: originalData,
    current: currentData,
  };

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Image resized successfully',
    data: responseData,
  });
});

export const ResizeControllers = {
  resizePhoto,
};
