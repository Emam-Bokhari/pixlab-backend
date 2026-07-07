import { PHOTO_TYPE } from '../photo.constant';
import { TEMPLATES } from './layouts.template';
import { PrintTemplate, TemplateSelectionInput } from './layouts.type';

/**
 * Resolves a fixed PrintTemplate for (photoType, paperSize, copies).
 *
 * This is intentionally a lookup, not a calculation. If the exact
 * copy count has no authored template, we fail loudly and tell the
 * caller which copy counts ARE supported — we never fall back to a
 * dynamic grid.
 */
export const selectTemplate = ({
  photoType,
  paperSize,
  copies,
}: TemplateSelectionInput): PrintTemplate => {
  if (photoType === PHOTO_TYPE.CUSTOM) {
    throw new Error(
      'CUSTOM photo type has no predefined templates. Provide an explicit PrintTemplate via selectCustomTemplate().',
    );
  }

  const byPaper = TEMPLATES[photoType]?.[paperSize];

  if (!byPaper) {
    throw new Error(
      `No templates defined for photoType="${photoType}" on paperSize="${paperSize}".`,
    );
  }

  const template = byPaper[copies];

  if (!template) {
    const supported = Object.keys(byPaper).join(', ');
    throw new Error(
      `Unsupported copies=${copies} for photoType="${photoType}" paperSize="${paperSize}". ` +
        `Supported copy counts are: ${supported}.`,
    );
  }

  return template;
};

/**
 * Explicit escape hatch for PHOTO_TYPE.CUSTOM: the caller (service layer)
 * must supply a fully-formed template. This keeps the "no dynamic grid"
 * rule intact — even custom layouts are a deliberate, named template,
 * just authored per-request instead of from the static table.
 */
export const selectCustomTemplate = (template: PrintTemplate): PrintTemplate => template;

export const listSupportedCopyCounts = (
  photoType: PHOTO_TYPE,
  paperSize: TemplateSelectionInput['paperSize'],
): number[] => {
  const byPaper = TEMPLATES[photoType]?.[paperSize];
  if (!byPaper) return [];
  return Object.keys(byPaper)
    .map(Number)
    .sort((a, b) => a - b);
};
