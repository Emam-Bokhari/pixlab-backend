import catchAsync from '../../shared/catchAsync';
import { ReduceServices } from './reduce.service';
import { HttpError } from '../../errors/HttpError';

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

  const mimeType = result.format === 'jpeg' ? 'image/jpeg'
    : result.format === 'webp' ? 'image/webp'
    : result.format === 'png' ? 'image/png'
    : 'image/jpeg';

  const ext = result.format === 'jpeg' ? 'jpg' : result.format;

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
      'X-Original-Width', 'X-Original-Height',
      'X-Original-Size-KB', 'X-Original-Size-MB',
      'X-Reduced-Width', 'X-Reduced-Height',
      'X-Reduced-Size-KB', 'X-Reduced-Size-MB',
      'X-Reduction-Percent', 'X-Target-Size-KB',
    ].join(', '),
  });

  res.send(result.buffer);
});

export const ReduceControllers = {
  reducePhoto,
};
