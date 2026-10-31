import fs from "fs";
import mongoose from "mongoose";
import path from "path";

import { BgRemove } from "./bgRemove.model";
import { BgRemoveDocument } from "./bgRemove.interface";
import { BG_REMOVE_STATUS } from "./bgRemove.constant";
import { removeBackground } from "./bgRemove.client";
import { saveBgRemoveImage } from "./bgRemove.utils";
import { generateBgRemovePhotoId } from "../../utils/generateYearBasedId";

const createBgRemoveJob = async (
  userId: string | undefined,
  data: any
): Promise<BgRemoveDocument> => {
  if (!data.image) {
    throw new Error("No file provided");
  }

  const { bgColor } = data;

  let originalBuffer: Buffer;

  if (typeof data.image === "string") {
    const filePath = path.join(process.cwd(), data.image);

    if (!fs.existsSync(filePath)) {
      throw new Error("Uploaded image file not found on server");
    }

    originalBuffer = fs.readFileSync(filePath);
  } else if (data.image.buffer) {
    originalBuffer = data.image.buffer;
  } else if (data.image.path) {
    originalBuffer = fs.readFileSync(data.image.path);
  } else {
    throw new Error("File buffer not found");
  }

  const cleanBgColor =
    typeof bgColor === "string" && bgColor.trim().length > 0
      ? bgColor.trim().replace(/^#/, "").toUpperCase()
      : undefined;

  // Generate ID only once
  const bgRemovePhotoId = await generateBgRemovePhotoId();

  // Save original image
  const originalImage = await saveBgRemoveImage(
    originalBuffer,
    bgRemovePhotoId,
    "original"
  );

  // Create DB record
  const job = new BgRemove({
    userId: userId && mongoose.Types.ObjectId.isValid(userId) ? new mongoose.Types.ObjectId(userId) : undefined,
    bgRemovePhotoId,
    originalImage,
    bgColor: cleanBgColor,
    status: BG_REMOVE_STATUS.PROCESSING,
  });
  await job.save();

  try {
    const processedBuffer = await removeBackground(
      originalBuffer,
      cleanBgColor
    );

    const processedImage = await saveBgRemoveImage(
      processedBuffer,
      bgRemovePhotoId,
      "processed"
    );

    job.processedImage = processedImage;
    job.status = BG_REMOVE_STATUS.SUCCESS;

    await job.save();

    return job;
  } catch (error: any) {
    job.status = BG_REMOVE_STATUS.FAILED;
    job.errorMessage = error?.message || "Background removal failed";

    await job.save();

    throw error;
  }
};

const getBgRemoveJobById = async (
  jobId: string
): Promise<BgRemoveDocument | null> => {
  return BgRemove.findById(jobId);
};

const getMyBgRemoveJobs = async (
  userId?: string,
  limit = 50
): Promise<BgRemoveDocument[]> => {
  const filter = userId ? { userId } : {};
  return BgRemove.find(filter)
    .sort({ createdAt: -1 })
    .limit(limit);
};

export const BgRemoveServices = {
  createBgRemoveJob,
  getBgRemoveJobById,
  getMyBgRemoveJobs,
};