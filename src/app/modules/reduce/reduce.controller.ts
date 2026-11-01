import catchAsync from '../../shared/catchAsync';
import { ReduceServices } from './reduce.service';
import { HttpError } from '../../errors/HttpError';
import sendResponse from '../../shared/sendResponse';
import { ReduceResponseData, ImageDetailsWithData } from './reduce.interface';

const reducePhoto = catchAsync(async (req, res) => {
  const file = req.file;

  if (!file) {
    throw new HttpError(400, 'No image file provided');
  }

  const targetSizeKb = Number(req.body?.targetSizeKb);
  if (!targetSizeKb || targetSizeKb <= 0) {
    throw new HttpError(400, 'targetSizeKb must be a positive number');
  }

  const result = await ReduceServices.reduceImageSize(file, targetSizeKb);

  const mimeType =
    result.format === 'jpeg' || result.format === 'jpg'
      ? 'image/jpeg'
      : result.format === 'webp'
      ? 'image/webp'
      : result.format === 'png'
      ? 'image/png'
      : 'image/jpeg';

  const ext = result.format === 'jpeg' ? 'jpg' : result.format;

  // If client explicitly requests binary file (e.g. ?type=binary or ?download=true)
  if (req.query?.type === 'binary' || req.query?.download === 'true') {
    res.set({
      'Content-Type': mimeType,
      'Content-Disposition': `attachment; filename="reduced.${ext}"`,
      'Content-Length': result.buffer.length.toString(),
      'X-Original-Width': result.original.widthPx.toString(),
      'X-Original-Height': result.original.heightPx.toString(),
      'X-Original-Size-KB': result.original.sizeKB.toString(),
      'X-Original-Size-MB': result.original.sizeMB.toString(),
      'X-Reduced-Width': result.reduced.widthPx.toString(),
      'X-Reduced-Height': result.reduced.heightPx.toString(),
      'X-Reduced-Size-KB': result.reduced.sizeKB.toString(),
      'X-Reduced-Size-MB': result.reduced.sizeMB.toString(),
      'X-Reduction-Percent': result.reductionPercentage.toString(),
      'X-Target-Size-KB': result.targetSizeKb.toString(),
      'Access-Control-Expose-Headers': [
        'X-Original-Width',
        'X-Original-Height',
        'X-Original-Size-KB',
        'X-Original-Size-MB',
        'X-Reduced-Width',
        'X-Reduced-Height',
        'X-Reduced-Size-KB',
        'X-Reduced-Size-MB',
        'X-Reduction-Percent',
        'X-Target-Size-KB',
      ].join(', '),
    });

    return res.send(result.buffer);
  }

  const originalMime = file.mimetype || 'image/jpeg';
  const originalBase64 = `data:${originalMime};base64,${file.buffer.toString('base64')}`;
  const reducedBase64 = `data:${mimeType};base64,${result.buffer.toString('base64')}`;

  const originalData: ImageDetailsWithData = {
    format: originalMime.split('/')[1] || 'jpeg',
    widthPx: result.original.widthPx,
    heightPx: result.original.heightPx,
    sizeBytes: result.original.sizeBytes,
    sizeKB: result.original.sizeKB,
    sizeMB: result.original.sizeMB,
    imageUrl: originalBase64,
  };

  const currentData: ImageDetailsWithData = {
    format: result.format,
    widthPx: result.reduced.widthPx,
    heightPx: result.reduced.heightPx,
    sizeBytes: result.reduced.sizeBytes,
    sizeKB: result.reduced.sizeKB,
    sizeMB: result.reduced.sizeMB,
    imageUrl: reducedBase64,
  };

  const responseData: ReduceResponseData = {
    original: originalData,
    current: currentData,
    targetSizeKb: result.targetSizeKb,
    reductionPercentage: result.reductionPercentage,
  };

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Image reduced successfully',
    data: responseData,
  });
});

export const ReduceControllers = {
  reducePhoto,
};
