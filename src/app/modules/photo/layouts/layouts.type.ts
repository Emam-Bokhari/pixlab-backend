import { PAPER_SIZE, PHOTO_TYPE } from '../photo.constant';

export type Orientation = 'portrait' | 'landscape';

export interface PaperDimensionsMm {
  widthMm: number;
  heightMm: number;
}

export interface PaperDimensionsPx {
  widthPx: number;
  heightPx: number;
}

export interface PhotoDimensionsPx {
  widthPx: number;
  heightPx: number;
}

/**
 * A PrintTemplate is a fixed, hand-authored layout definition.
 * There is no "maxCols" or dynamic packing math involved — the
 * rows/columns are decided up-front, exactly like a real minilab
 * template file (Fuji Frontier / Noritsu / DNP templates work the
 * same way: a fixed number of named templates per paper/photo combo).
 */
export interface PrintTemplate {
  /** Human readable id, also stored on the Photo document */
  name: string;
  rows: number;
  columns: number;
  marginMm: number;
  gapMm: number;
  orientation: Orientation;
}

export interface GridPosition {
  xPx: number;
  yPx: number;
}

export interface LayoutResult {
  template: PrintTemplate;
  paperSize: PAPER_SIZE;
  paperPx: PaperDimensionsPx;
  photoPx: PhotoDimensionsPx;
  positions: GridPosition[];
  totalSlots: number;
  dpi: number;
}

export interface TemplateSelectionInput {
  photoType: PHOTO_TYPE;
  paperSize: PAPER_SIZE;
  copies: number;
}
