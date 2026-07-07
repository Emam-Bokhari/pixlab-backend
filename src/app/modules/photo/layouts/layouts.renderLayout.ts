import sharp from 'sharp';
import { LayoutResult } from './layouts.type';

export interface RenderOptions {
  /** RGBA background, defaults to opaque white */
  backgroundColor?: { r: number; g: number; b: number; alpha: number };
  /** How many of the layout's slots to actually fill (<= totalSlots) */
  copiesToRender?: number;
}

/**
 * Renders a single processed photo into a full print-ready sheet:
 *  1. resize the source photo to the EXACT print pixel size (never composite raw)
 *  2. build a blank paper canvas at the exact paper pixel size
 *  3. composite the resized photo at every centered grid position
 *  4. embed 300 DPI metadata on the output
 *
 * Returns a PNG buffer. Format conversion (jpg/webp) happens downstream
 * in photo.utils.ts so this function has a single responsibility.
 */
export const renderLayout = async (
  singleImageBuffer: Buffer,
  layout: LayoutResult,
  options: RenderOptions = {},
): Promise<Buffer> => {
  const {
    backgroundColor = { r: 255, g: 255, b: 255, alpha: 1 },
    copiesToRender = layout.totalSlots,
  } = options;

  if (copiesToRender > layout.totalSlots) {
    throw new Error(
      `copiesToRender (${copiesToRender}) exceeds template capacity (${layout.totalSlots}) for template "${layout.template.name}".`,
    );
  }

  const resizedPhotoBuffer = await sharp(singleImageBuffer)
    .resize(layout.photoPx.widthPx, layout.photoPx.heightPx, { fit: 'fill' })
    .toBuffer();

  const composites = layout.positions.slice(0, copiesToRender).map((position) => ({
    input: resizedPhotoBuffer,
    left: position.xPx,
    top: position.yPx,
  }));

  return sharp({
    create: {
      width: layout.paperPx.widthPx,
      height: layout.paperPx.heightPx,
      channels: 4,
      background: backgroundColor,
    },
  })
    .composite(composites)
    .withMetadata({ density: layout.dpi })
    .png({ quality: 100 })
    .toBuffer();
};
