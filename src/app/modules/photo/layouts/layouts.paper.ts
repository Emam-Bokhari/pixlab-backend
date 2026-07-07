import { PAPER_SIZE } from '../photo.constant';
import { DPI, MM_PER_INCH } from './layouts.constant';
import { Orientation, PaperDimensionsMm, PaperDimensionsPx } from './layouts.type';

/**
 * Real physical paper sizes in millimeters (landscape orientation,
 * width x height), matching standard minilab paper cuts.
 */
export const PAPER_DIMENSIONS_MM: Record<PAPER_SIZE, PaperDimensionsMm> = {
  [PAPER_SIZE.FOUR_R]: { widthMm: 152, heightMm: 102 },
  [PAPER_SIZE.FIVE_R]: { widthMm: 178, heightMm: 127 },
  [PAPER_SIZE.SIX_R]: { widthMm: 203, heightMm: 152 },
  [PAPER_SIZE.A_FOUR]: { widthMm: 210, heightMm: 297 },
};

export const mmToPx = (mm: number, dpi: number = DPI): number =>
  Math.round((mm * dpi) / MM_PER_INCH);

export const pxToMm = (px: number, dpi: number = DPI): number => (px * MM_PER_INCH) / dpi;

export const getPaperDimensionsMm = (paperSize: PAPER_SIZE): PaperDimensionsMm => {
  const dims = PAPER_DIMENSIONS_MM[paperSize];
  if (!dims) {
    throw new Error(`Unsupported paper size: ${paperSize}`);
  }
  return dims;
};

export const getPaperDimensionsPx = (
  paperSize: PAPER_SIZE,
  dpi: number = DPI,
): PaperDimensionsPx => {
  const { widthMm, heightMm } = getPaperDimensionsMm(paperSize);
  return {
    widthPx: mmToPx(widthMm, dpi),
    heightPx: mmToPx(heightMm, dpi),
  };
};

/**
 * A physical paper cut (e.g. 4R = 152x102mm) can be fed through a
 * printer either way — the "natural" cut has a fixed longer/shorter
 * side, but a template can request the sheet be treated as landscape
 * or portrait. This swaps width/height when the requested orientation
 * doesn't match the paper's natural orientation.
 *
 * This is the piece that was previously missing: PrintTemplate.orientation
 * was being stored but never actually applied to the geometry.
 */
export const getPaperDimensionsPxForOrientation = (
  paperSize: PAPER_SIZE,
  orientation: Orientation,
  dpi: number = DPI,
): PaperDimensionsPx => {
  const natural = getPaperDimensionsPx(paperSize, dpi);
  const naturalOrientation: Orientation =
    natural.widthPx >= natural.heightPx ? 'landscape' : 'portrait';

  if (naturalOrientation === orientation) return natural;

  return { widthPx: natural.heightPx, heightPx: natural.widthPx };
};
