import { PDFDocument } from 'pdf-lib';
import { LayoutResult } from '../layouts/layouts.type';
import { pxToMm } from '../layouts/layouts.paper';

const PDF_POINTS_PER_INCH = 72;
const MM_PER_INCH = 25.4;

const mmToPoints = (mm: number): number => (mm * PDF_POINTS_PER_INCH) / MM_PER_INCH;

/**
 * Wraps an already-rendered print-layout PNG (from render-layout.ts) into
 * a single-page PDF whose page size exactly matches the physical paper
 * size, expressed in PDF points (1/72 inch).
 *
 * Why this matters: a plain PNG has no notion of "this is a 4R sheet" —
 * browsers/print dialogs just see raw pixels and guess a paper size
 * (usually A4), which is what caused the layout to appear shrunk with
 * huge margins. A PDF page carries its physical size in the document
 * itself, so any PDF viewer or print dialog will pick the correct
 * paper size automatically instead of guessing.
 *
 * The page's mm size is derived from layout.paperPx (not re-looked-up
 * from paperSize + orientation) so it's guaranteed to exactly match the
 * pixel canvas that was actually rendered — one source of truth, no
 * chance of an orientation mismatch between the PNG and the PDF page.
 */
export const renderLayoutPdf = async (
  layoutPngBuffer: Buffer,
  layout: LayoutResult,
): Promise<Buffer> => {
  const paperWidthMm = pxToMm(layout.paperPx.widthPx, layout.dpi);
  const paperHeightMm = pxToMm(layout.paperPx.heightPx, layout.dpi);

  const pageWidthPt = mmToPoints(paperWidthMm);
  const pageHeightPt = mmToPoints(paperHeightMm);

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([pageWidthPt, pageHeightPt]);
  const pngImage = await pdfDoc.embedPng(layoutPngBuffer);

  // Draw the layout image to cover the full page 1:1 — the PNG's pixel
  // dimensions already equal the page's physical size at layout.dpi.
  page.drawImage(pngImage, {
    x: 0,
    y: 0,
    width: pageWidthPt,
    height: pageHeightPt,
  });

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
};
