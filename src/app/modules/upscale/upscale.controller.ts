import catchAsync from '../../shared/catchAsync';
import { UpscaleServices } from './upscale.service';
import { HttpError } from '../../errors/HttpError';

const upscalePhoto = catchAsync(async (req, res) => {
  const file = req.file;

  if (!file) {
    throw new HttpError(400, 'No image file provided');
  }

  const scale = req.body?.scale ? Number(req.body.scale) : 2;

  const result = await UpscaleServices.upscaleImage(file, scale);

  const mimeType =
    result.format === 'jpeg' ? 'image/jpeg'
    : result.format === 'webp' ? 'image/webp'
    : result.format === 'avif' ? 'image/avif'
    : result.format === 'tiff' ? 'image/tiff'
    : 'image/png';

  const ext = result.format === 'jpeg' ? 'jpg' : result.format;

  res.set({
    'Content-Type': mimeType,
    'Content-Disposition': `attachment; filename="upscaled.${ext}"`,
    'Content-Length': result.buffer.length.toString(),
    'X-Scale': result.scale.toString(),
    'X-Original-Width': result.original.widthPx.toString(),
    'X-Original-Height': result.original.heightPx.toString(),
    'X-Original-Size-KB': result.original.sizeKB.toString(),
    'X-Original-Size-MB': result.original.sizeMB.toString(),
    'X-Upscaled-Width': result.upscaled.widthPx.toString(),
    'X-Upscaled-Height': result.upscaled.heightPx.toString(),
    'X-Upscaled-Size-KB': result.upscaled.sizeKB.toString(),
    'X-Upscaled-Size-MB': result.upscaled.sizeMB.toString(),
    'X-Width-Increase-Percent': result.increase.widthPercent.toString(),
    'X-Height-Increase-Percent': result.increase.heightPercent.toString(),
    'X-Size-Increase-Percent': result.increase.sizeBytesPercent.toString(),
    'X-Size-MB-Diff': result.increase.sizeMBDiff.toString(),
    'Access-Control-Expose-Headers': [
      'X-Scale',
      'X-Original-Width', 'X-Original-Height',
      'X-Original-Size-KB', 'X-Original-Size-MB',
      'X-Upscaled-Width', 'X-Upscaled-Height',
      'X-Upscaled-Size-KB', 'X-Upscaled-Size-MB',
      'X-Width-Increase-Percent', 'X-Height-Increase-Percent',
      'X-Size-Increase-Percent', 'X-Size-MB-Diff',
    ].join(', '),
  });

  res.send(result.buffer);
});

export const UpscaleControllers = {
  upscalePhoto,
};
