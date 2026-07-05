import { PAPER_SIZE, PHOTO_TYPE } from '../photo.constant';
import { Orientation, PrintTemplate } from './layouts.type';




/**
 * Predefined, hand-authored templates — exactly how real minilab
 * software (Fuji Frontier / Noritsu / DNP) ships fixed layout files.
 *
 * Keyed as: TEMPLATES[photoType][paperSize][copies] -> PrintTemplate
 *
 * IMPORTANT: every entry below has been checked by hand against the
 * real paper mm size and photo mm size (rows*photoH + (rows-1)*gap
 * must fit within paperHeight-2*margin, same for columns/width, after
 * accounting for orientation). Copy counts that are NOT geometrically
 * possible for a given photo size + paper (e.g. 8 passport photos on
 * a 4R sheet — that genuinely does not fit, at any sane margin) are
 * intentionally left out rather than forced to "fit" with an
 * unrealistic margin/gap.
 *
 * If you need a copy count that isn't listed, either move to a bigger
 * paper size or add a new verified entry — never shrink margin/gap
 * blindly just to make the math pass; re-verify by hand instead.
 */
type TemplateTable = Partial<
  Record<PHOTO_TYPE, Partial<Record<PAPER_SIZE, Record<number, PrintTemplate>>>>
>;

const tpl = (
  photoType: PHOTO_TYPE,
  rows: number,
  columns: number,
  marginMm: number,
  gapMm: number,
  orientation: Orientation
): PrintTemplate => ({
  name: `${photoType}-${rows}x${columns}-${orientation}`,
  rows,
  columns,
  marginMm,
  gapMm,
  orientation,
});

// ---------------------------------------------------------------------
// 35x45mm photos (passport / nid / visa share this size)
// ---------------------------------------------------------------------
const buildPortraitPhotoSet = (photoType: PHOTO_TYPE) => ({
  [PAPER_SIZE.FOUR_R]: {
    2: tpl(photoType, 1, 2, 5, 4, 'landscape'),
    4: tpl(photoType, 2, 2, 4, 4, 'landscape'),
    6: tpl(photoType, 2, 3, 4, 4, 'landscape'),
  },
  [PAPER_SIZE.FIVE_R]: {
    6: tpl(photoType, 2, 3, 4, 4, 'landscape'),
    8: tpl(photoType, 2, 4, 4, 4, 'landscape'),
    9: tpl(photoType, 3, 3, 4, 4, 'portrait'),
  },
  [PAPER_SIZE.SIX_R]: {
    8: tpl(photoType, 2, 4, 4, 4, 'landscape'),
    12: tpl(photoType, 4, 3, 4, 4, 'portrait'),
    16: tpl(photoType, 4, 4, 3, 2, 'portrait'),
  },
  [PAPER_SIZE.A_FOUR]: {
    12: tpl(photoType, 3, 4, 5, 4, 'portrait'),
    20: tpl(photoType, 5, 4, 5, 4, 'portrait'),
    24: tpl(photoType, 6, 4, 4, 3, 'portrait'),
    30: tpl(photoType, 6, 5, 4, 3, 'portrait'),
  },
});

// ---------------------------------------------------------------------
// 25x35mm photos (stamp)
// ---------------------------------------------------------------------
const buildStampSet = (photoType: PHOTO_TYPE) => ({
  [PAPER_SIZE.FOUR_R]: {
    4: tpl(photoType, 2, 2, 4, 3, 'landscape'),
    6: tpl(photoType, 2, 3, 4, 3, 'landscape'),
    8: tpl(photoType, 2, 4, 4, 3, 'landscape'),
  },
  [PAPER_SIZE.FIVE_R]: {
    12: tpl(photoType, 3, 4, 4, 3, 'landscape'),
    16: tpl(photoType, 4, 4, 4, 3, 'portrait'),
  },
  [PAPER_SIZE.SIX_R]: {
    20: tpl(photoType, 4, 5, 3, 2, 'portrait'),
    24: tpl(photoType, 4, 6, 3, 2, 'landscape'),
  },
  [PAPER_SIZE.A_FOUR]: {
    30: tpl(photoType, 6, 5, 5, 3, 'portrait'),
    36: tpl(photoType, 6, 6, 5, 3, 'portrait'),
  },
});

export const TEMPLATES: TemplateTable = {
  [PHOTO_TYPE.PASSPORT]: buildPortraitPhotoSet(PHOTO_TYPE.PASSPORT),
  [PHOTO_TYPE.NID]: buildPortraitPhotoSet(PHOTO_TYPE.NID),
  [PHOTO_TYPE.VISA]: buildPortraitPhotoSet(PHOTO_TYPE.VISA),
  [PHOTO_TYPE.STAMP]: buildStampSet(PHOTO_TYPE.STAMP),

  // CUSTOM has no predefined templates — callers must supply their own
  // PrintTemplate directly to the layout engine (see template-selector.ts).
  [PHOTO_TYPE.CUSTOM]: {},
};