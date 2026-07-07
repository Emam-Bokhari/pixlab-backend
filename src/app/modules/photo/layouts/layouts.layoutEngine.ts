import { PAPER_SIZE } from '../photo.constant';
import { SizeInfo } from '../photo.interface';
import { DPI } from './layouts.constant';
import { getPaperDimensionsPxForOrientation, mmToPx } from './layouts.paper';
import { GridPosition, LayoutResult, PrintTemplate } from './layouts.type';

/**
 * Pure calculation: given a fixed template + paper size + photo size,
 * compute exact pixel positions for every slot, centered on the paper.
 *
 * Steps (always in this order):
 *  1. printable paper size in px
 *  2. photo size in px
 *  3. grid width/height in px (rows/cols come from the template, never computed)
 *  4. centered start X / start Y
 *  5. one position per slot, row-major
 */
export const calculateLayout = (
  template: PrintTemplate,
  paperSize: PAPER_SIZE,
  photoSizeInfo: SizeInfo,
  dpi: number = DPI,
): LayoutResult => {
  const paperPx = getPaperDimensionsPxForOrientation(paperSize, template.orientation, dpi);

  const photoPx = {
    widthPx: mmToPx(photoSizeInfo.mmWidth, dpi),
    heightPx: mmToPx(photoSizeInfo.mmHeight, dpi),
  };

  const gapPx = mmToPx(template.gapMm, dpi);
  const marginPx = mmToPx(template.marginMm, dpi);

  const gridWidthPx = template.columns * photoPx.widthPx + (template.columns - 1) * gapPx;
  const gridHeightPx = template.rows * photoPx.heightPx + (template.rows - 1) * gapPx;

  const printableWidthPx = paperPx.widthPx - marginPx * 2;
  const printableHeightPx = paperPx.heightPx - marginPx * 2;

  if (gridWidthPx > printableWidthPx || gridHeightPx > printableHeightPx) {
    throw new Error(
      `Template "${template.name}" (${template.rows}x${template.columns}) does not fit on ` +
        `paperSize="${paperSize}" with marginMm=${template.marginMm}, gapMm=${template.gapMm}. ` +
        `Grid is ${gridWidthPx}x${gridHeightPx}px, printable area is ${printableWidthPx}x${printableHeightPx}px.`,
    );
  }

  const startX = Math.round((paperPx.widthPx - gridWidthPx) / 2);
  const startY = Math.round((paperPx.heightPx - gridHeightPx) / 2);

  const positions: GridPosition[] = [];

  for (let row = 0; row < template.rows; row++) {
    for (let col = 0; col < template.columns; col++) {
      positions.push({
        xPx: startX + col * (photoPx.widthPx + gapPx),
        yPx: startY + row * (photoPx.heightPx + gapPx),
      });
    }
  }

  return {
    template,
    paperSize,
    paperPx,
    photoPx,
    positions,
    totalSlots: template.rows * template.columns,
    dpi,
  };
};
