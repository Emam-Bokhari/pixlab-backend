import axios from 'axios';
import fs from 'fs';
import { Photo } from './photo.model';
import { bufferToBase64 } from './photo.utils';
import { PHOTO_STATUS } from './photo.constant';
import { PhotoDocument, PhotoInput } from './photo.interface';
import config from '../../config';
import { downloadAndSaveProcessedImage } from '../../middlewares/parseFileData';


// const createPhotoToDB = async (
//   data: Omit<PhotoInput, 'sizeInfo'> & {
//     sizeInfo: { name: string; mmWidth: number; mmHeight: number };
//   },
//   userId: string,
//   file?: Express.Multer.File
// ): Promise<PhotoDocument> => {
//   const { originalImage, photoType, bgColor = 'FFFFFF', copies, sizeInfo } = data;

//   if (!file) throw new Error('No file provided');

//   const photo = new Photo({
//     userId,
//     originalImage,
//     country: 'Bangladesh',
//     photoType,
//     sizeInfo,
//     bgColor,                  
//     copies: copies || 1,
//     status: 'processing',
//   });

//   await photo.save();

//   let buffer: Buffer;
//   if (file.buffer) {
//     buffer = file.buffer;
//   } else if (file.path) {
//     buffer = fs.readFileSync(file.path);
//   } else {
//     throw new Error('File has neither buffer nor path');
//   }

//   const base64Image = bufferToBase64(buffer);


//   const cleanBgColor = (bgColor || 'FFFFFF').replace('#', '').toUpperCase();

//   const payload = {
//     base64: base64Image,
//     bgColor: cleanBgColor,
//     dpi: 300,
//     mmWidth: sizeInfo.mmWidth,
//     mmHeight: sizeInfo.mmHeight,
//     printBgColor: cleanBgColor,
//     printMmWidth: 0,
//     printMmHeight: 0,
//     printMaxCount: photo.copies || 1,
//   };

//   if ((photo.copies ?? 1) > 1) {
//     payload.printMmWidth = sizeInfo.mmWidth * 4;
//     payload.printMmHeight = sizeInfo.mmHeight * 3;
//   }

//   const response = await axios.post(config.cutout_pro_api_url!, payload, {
//     headers: {
//       'APIKEY': config.cutout_pro_api_key,
//       'Content-Type': 'application/json',
//     },
//     timeout: 35000,
//   });

//   const result = response.data;

//   if (result.code === 0 && result.data) {
//     photo.idPhotoImage = result.data.idPhotoImage;
//     photo.printLayoutImage = result.data.printLayoutImage || result.data.idPhotoImage;
//     photo.status = PHOTO_STATUS.SUCCESS;
//     photo.creditsUsed = 1;
//     photo.expiresAt = new Date(Date.now() + 10 * 60 * 1000);
//   } else {
//     throw new Error(result.msg || 'Cutout Pro processing failed');
//   }

//   await photo.save();
//   return photo;
// };

const createPhotoToDB = async (
  data: Omit<PhotoInput, 'sizeInfo'> & {
    sizeInfo: { name: string; mmWidth: number; mmHeight: number };
  },
  userId: string,
  file?: Express.Multer.File
): Promise<PhotoDocument> => {
  const { originalImage, photoType, bgColor = 'FFFFFF', copies, sizeInfo } = data;

  if (!file) {
    throw new Error('No file provided');
  }

  const photo = new Photo({
    userId,
    originalImage,
    country: 'Bangladesh',
    photoType,
    sizeInfo,
    bgColor,
    copies: copies || 1,
    status: 'processing',
  });

  await photo.save();

  let buffer: Buffer;
  if (file.buffer) {
    buffer = file.buffer;
  } else if (file.path) {
    buffer = fs.readFileSync(file.path);
  } else {
    throw new Error('File has neither buffer nor path');
  }

  const base64Image = bufferToBase64(buffer);

  const cleanBgColor = (bgColor || 'FFFFFF').replace('#', '').toUpperCase();

  const payload = {
    base64: base64Image,
    bgColor: cleanBgColor,
    dpi: 300,
    mmWidth: sizeInfo.mmWidth,
    mmHeight: sizeInfo.mmHeight,
    printBgColor: cleanBgColor,
    printMmWidth: 0,
    printMmHeight: 0,
    printMaxCount: photo.copies || 1,
  };

  if ((photo.copies ?? 1) > 1) {
    payload.printMmWidth = sizeInfo.mmWidth * 4;
    payload.printMmHeight = sizeInfo.mmHeight * 3;
  }

  try {
    const response = await axios.post(config.cutout_pro_api_url!, payload, {
      headers: {
        'APIKEY': config.cutout_pro_api_key,
        'Content-Type': 'application/json',
      },
      timeout: 35000,
    });

    const result = response.data;

    if (result.code === 0 && result.data) {
      const tempSingleUrl = result.data.idPhotoImage;
      const tempLayoutUrl = result.data.printLayoutImage || tempSingleUrl;

      const singleImageUrl = await downloadAndSaveProcessedImage(
        tempSingleUrl,
        userId,
        photoType,
        'single'
      );

      const layoutImageUrl = await downloadAndSaveProcessedImage(
        tempLayoutUrl,
        userId,
        photoType,
        'layout'
      );

      
      photo.idPhotoImage = singleImageUrl;
      photo.printLayoutImage = layoutImageUrl;
      photo.status = PHOTO_STATUS.SUCCESS;
      photo.creditsUsed = 1;
      photo.expiresAt = new Date(Date.now() + 10 * 60 * 1000);

      await photo.save();
      return photo;
    } else {
      throw new Error(result.msg || 'Cutout Pro processing failed');
    }
  } catch (error: any) {
    photo.status = PHOTO_STATUS.FAILED;
    photo.errorMessage = error.message || 'Unknown error occurred';
    await photo.save();
    throw error;
  }
};

export const PhotoServices={
    createPhotoToDB,
}