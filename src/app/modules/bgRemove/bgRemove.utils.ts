// import fs from 'fs';
// import path from 'path';
// import { generateBgRemovePhotoId } from '../../utils/generateYearBasedId';

// const BASE_UPLOAD_DIR = path.join(process.cwd(), 'uploads');
// const FOLDER_NAME = 'bg-remove';

// /**
//  * Saves a buffer to disk under uploads/bgRemove and returns the public
//  * URL path, following the same /uploads/<folder>/<file> convention
//  * used elsewhere in the project.
//  */
// export const saveBgRemoveImage = async (buffer: Buffer, userId: string, suffix: 'original' | 'processed'): Promise<string> => {
//   const dir = path.join(BASE_UPLOAD_DIR, FOLDER_NAME);
//   if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

//   // const fileName = `${userId}-${suffix}-${Date.now()}.png`;
//   const bgRemovePhotoId = await generateBgRemovePhotoId();
//   const fileName = `${bgRemovePhotoId}.png`;

//   const filePath = path.join(dir, fileName);
//   fs.writeFileSync(filePath, buffer);

//   return `/uploads/${FOLDER_NAME}/${fileName}`;
// };

import fs from "fs";
import path from "path";

const BASE_UPLOAD_DIR = path.join(process.cwd(), "uploads");
const FOLDER_NAME = "bg-remove";

export const saveBgRemoveImage = async (
  buffer: Buffer,
  bgRemovePhotoId: string,
  suffix: "original" | "processed",
): Promise<string> => {
  const dir = path.join(BASE_UPLOAD_DIR, FOLDER_NAME);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const fileName = `${bgRemovePhotoId}-${suffix}.png`;

  const filePath = path.join(dir, fileName);

  fs.writeFileSync(filePath, buffer);

  return `/uploads/${FOLDER_NAME}/${fileName}`;
};