import { Request, Response, NextFunction } from 'express';
import { IFolderName } from './fileUploadHandler';
import { mapFilesToUrls, mapFileToUrl } from './fileMapper';
import { HttpError } from '../errors/HttpError';
import axios from 'axios';
import fs from 'fs';
import path from 'path';

// types
interface FileFieldConfig {
  fieldName: IFolderName;
  mode?: 'single' | 'multiple' | 'auto';
}

type FieldInput = IFolderName | FileFieldConfig;

type MulterFiles = {
  [key in IFolderName]?: Express.Multer.File[];
};

// normalizer
const normalizeField = (field: FieldInput) => {
  if (typeof field === 'string') {
    return { fieldName: field, mode: 'auto' as const };
  }

  return {
    fieldName: field.fieldName,
    mode: field.mode ?? 'auto',
  };
};

// safe json parse (FIXED)
const safeJsonParse = (value: any) => {
  if (typeof value !== 'string') return value;
  try {
    return JSON.parse(value);
  } catch {
    throw new HttpError(400, 'Invalid JSON in body.data');
  }
};

// auto mode resolver
const resolveMode = (
  mode: 'single' | 'multiple' | 'auto',
  files?: Express.Multer.File[],
): 'single' | 'multiple' => {
  if (mode !== 'auto') return mode;
  return files && files.length <= 1 ? 'single' : 'multiple';
};

// main middleware
export const parseFileData = (...fields: FieldInput[]) => {
  const normalized = fields.map(normalizeField);

  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const files = (req.files || {}) as MulterFiles;

      const fileData: Record<string, string | string[]> = {};

      for (const { fieldName, mode } of normalized) {
        const fieldFiles = files[fieldName];

        if (!fieldFiles || fieldFiles.length === 0) continue;

        const resolvedMode = resolveMode(mode, fieldFiles);

        if (resolvedMode === 'single') {
          fileData[fieldName] = mapFileToUrl(fieldFiles[0]!, fieldName);
        } else {
          fileData[fieldName] = mapFilesToUrls(fieldFiles, fieldName);
        }
      }

      let parsedBody: Record<string, unknown> = {};

      if (req.body?.data) {
        parsedBody = safeJsonParse(req.body.data);
      }

      req.body = {
        ...req.body,
        ...parsedBody,
        ...fileData,
      };

      if (req.body.data) {
        delete req.body.data;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

const BASE_UPLOAD_DIR = path.join(process.cwd(), 'uploads');


export const downloadAndSaveProcessedImage = async (
  cutoutUrl: string,
  userId: string,
  photoType: string,
  type: 'single' | 'layout' = 'single'
): Promise<string> => {
  try {
    const response = await axios.get(cutoutUrl, { 
      responseType: 'arraybuffer',
      headers: {
        'Accept': 'image/png, image/jpeg, image/webp'
      }
    });

    const buffer = Buffer.from(response.data);

    const folderName: IFolderName = 'originalImage'; 
    const dir = path.join(BASE_UPLOAD_DIR, folderName);
    
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const fileName = `${userId}-${photoType}-${type}-${Date.now()}.png`;
    const filePath = path.join(dir, fileName);

    fs.writeFileSync(filePath, buffer);

    return `/uploads/${folderName}/${fileName}`;

  } catch (error) {
    console.error('Image download failed:', error);
    throw new Error('Failed to download and save processed image');
  }
};