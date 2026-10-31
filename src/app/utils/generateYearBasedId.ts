import { Model } from "mongoose";
import { BgRemove } from "../modules/bgRemove/bgRemove.model";
import { Photo } from "../modules/photo/photo.model";
import { Reduce } from "../modules/reduce/reduce.model";
import { Resize } from "../modules/resize/resize.model";
import { Upscale } from "../modules/upscale/upscale.model";

const generateYearBasedId = async (
  model: Model<any>,
  fieldName: string,
  prefix: string,
): Promise<string> => {
  const currentYear = new Date().getUTCFullYear().toString();

  const lastDocument = await model
    .findOne({}, { [fieldName]: 1, _id: 0 })
    .sort({ createdAt: -1 })
    .lean();

  const lastId = lastDocument?.[fieldName] as string | undefined;

  let nextNumber = 1;

  if (lastId) {
    const parts = lastId.split("-");

    // Works for:
    // PHOTO-2026-0001
    // REDUCED-PHOTO-2026-0001
    // BG-REMOVE-PHOTO-2026-0001
    const lastYear = parts[parts.length - 2];
    const lastSequence = parts[parts.length - 1];

    if (
      lastYear === currentYear &&
      lastSequence &&
      !Number.isNaN(Number(lastSequence))
    ) {
      nextNumber = Number(lastSequence) + 1;
    }
  }

  return `${prefix}-${currentYear}-${String(nextNumber).padStart(4, "0")}`;
};

// PHOTO
export const generatePhotoId = () =>
  generateYearBasedId(Photo, "photoId", "PHOTO");

// REDUCED PHOTO
export const generateReducedPhotoId = () =>
  generateYearBasedId(Reduce, "reducedPhotoId", "REDUCED-PHOTO");

// RESIZED PHOTO
export const generateResizedPhotoId = () =>
  generateYearBasedId(Resize, "resizedPhotoId", "RESIZED-PHOTO");

// UPSCALED PHOTO
export const generateUpscalePhotoId = () =>
  generateYearBasedId(Upscale, "upscaledPhotoId", "UPSCALED-PHOTO");

// BG REMOVE PHOTO
export const generateBgRemovePhotoId = () =>
  generateYearBasedId(BgRemove, "bgRemovePhotoId", "BG-REMOVE-PHOTO");