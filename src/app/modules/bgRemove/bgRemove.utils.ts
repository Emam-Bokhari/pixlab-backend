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
