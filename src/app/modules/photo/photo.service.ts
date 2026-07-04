import axios from 'axios';
import fs from 'fs';
import { Photo } from './photo.model';
import { bufferToBase64, createPrintLayout, downloadImageAsBuffer } from './photo.utils';
import { PAPER_SIZE, PHOTO_STATUS } from './photo.constant';
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
//   const { originalImage, photoType, bgColor = 'FFFFFF', copies = 1, sizeInfo } = data;

//   if (!file) {
//     throw new Error('No file provided');
//   }

//   const photo = new Photo({
//     userId,
//     originalImage,
//     country: 'Bangladesh',
//     photoType,
//     sizeInfo,
//     bgColor,
//     copies,
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

//   try {
//     const payload: any = {
//       base64: base64Image,
//       bgColor: cleanBgColor,
//       dpi: 300,
//       mmWidth: sizeInfo.mmWidth,
//       mmHeight: sizeInfo.mmHeight,
//       printBgColor: cleanBgColor,
//     };

//     // ====================== IMPROVED PRINT LAYOUT ======================
//     if (copies > 1) {
//       const singleW = sizeInfo.mmWidth;
//       const singleH = sizeInfo.mmHeight;

//       let cols = 2;
//       let rows = Math.ceil(copies / cols);

//       if (photoType === 'stamp') {
//         if (copies === 4) {
//           cols = 2;
//           rows = 2;
//         } else if (copies === 6) {
//           cols = 2;
//           rows = 3;
//         } else if (copies === 8) {
//           cols = 2;
//           rows = 4;
//         }
//       }

//       const gapMm = 6;      // Gap between photos (increased)
//       const marginMm = 8;   // Outer margin

//       // Gap er jonno alada background color (White recommended)
//       const printLayoutBg = '#FFFFFF';   // Change korte paro: #F0F0F0, #E5E5E5 etc.

//       payload.printMaxCount = copies;
//       payload.printMmWidth = (singleW * cols) + (gapMm * (cols - 1)) + (marginMm * 2);
//       payload.printMmHeight = (singleH * rows) + (gapMm * (rows - 1)) + (marginMm * 2);
//       payload.printBgColor = printLayoutBg.replace('#', ''); // Cutout Pro expects without #

//       // Bangladesh Stamp Size (20x25mm) - 4 copies best layout
//       if (photoType === 'stamp' && copies === 4) {
//         payload.printMmWidth = 58;
//         payload.printMmHeight = 70;
//       }
//     } else {
//       payload.printMaxCount = 1;
//     }
//     // =================================================================

//     // Cutout Pro API Call
//     const response = await axios.post(config.cutout_pro_api_url!, payload, {
//       headers: {
//         'APIKEY': config.cutout_pro_api_key,
//         'Content-Type': 'application/json',
//       },
//       timeout: 35000,
//     });

//     const result = response.data;

//     if (result.code === 0 && result.data) {
//       const singleImageUrl = result.data.idPhotoImage;
//       const printLayoutUrl = result.data.printLayoutImage || singleImageUrl;

//       if (!singleImageUrl) {
//         throw new Error('No image URL returned from Cutout Pro');
//       }

//       const [pngUrl, jpgUrl, webpUrl] = await Promise.all([
//         downloadAndSaveProcessedImage(singleImageUrl, userId, photoType, 'png'),
//         downloadAndSaveProcessedImage(singleImageUrl, userId, photoType, 'jpg'),
//         downloadAndSaveProcessedImage(singleImageUrl, userId, photoType, 'webp'),
//       ]);

//       photo.pngUrl = pngUrl;
//       photo.jpgUrl = jpgUrl;
//       photo.webpUrl = webpUrl;

//       photo.idPhotoImage = pngUrl;
//       photo.printLayoutImage = printLayoutUrl;

//       photo.status = PHOTO_STATUS.SUCCESS;
//       photo.creditsUsed = 1;
//       photo.expiresAt = new Date(Date.now() + 10 * 60 * 1000);

//       await photo.save();
//       return photo;
//     } else {
//       throw new Error(result.msg || 'Cutout Pro processing failed');
//     }
//   } catch (error: any) {
//     photo.status = PHOTO_STATUS.FAILED;
//     photo.errorMessage = error.message || 'Unknown error';
//     await photo.save();
//     throw error;
//   }
// };

// const createPhotoToDB = async (
//   data: Omit<PhotoInput, 'sizeInfo'> & {
//     sizeInfo: { name: string; mmWidth: number; mmHeight: number };
//   },
//   userId: string,
//   file?: Express.Multer.File
// ): Promise<PhotoDocument> => {
//   const { originalImage, photoType, bgColor = 'FFFFFF', copies = 1, sizeInfo } = data;

//   if (!file) throw new Error('No file provided');

//   const photo = new Photo({
//     userId,
//     originalImage,
//     country: 'Bangladesh',
//     photoType,
//     sizeInfo,
//     bgColor,
//     copies,
//     status: 'processing',
//   });

//   await photo.save();

//   const buffer = file.buffer || fs.readFileSync(file.path);
//   const base64Image = bufferToBase64(buffer);
//   const cleanBgColor = (bgColor || 'FFFFFF').replace('#', '').toUpperCase();

//   try {
//     const payload: any = {
//       base64: base64Image,
//       bgColor: cleanBgColor,
//       dpi: 300,
//       mmWidth: sizeInfo.mmWidth,
//       mmHeight: sizeInfo.mmHeight,
//       printBgColor: 'FFFFFF',           // Gap er color (White)
//     };

//     // ===================== DYNAMIC PRINT LAYOUT =====================
//     if (copies > 1) {
//       const singleW = sizeInfo.mmWidth;
//       const singleH = sizeInfo.mmHeight;

//       const cols = 2;
//       const rows = Math.ceil(copies / cols);

//       const gapMm = 5;      // Photos er moddhe gap
//       const marginMm = 7;   // Outer margin

//       payload.printMaxCount = copies;
//       payload.printMmWidth = (singleW * cols) + (gapMm * (cols - 1)) + (marginMm * 2);
//       payload.printMmHeight = (singleH * rows) + (gapMm * (rows - 1)) + (marginMm * 2);

//       // Optional: Stamp size er jonno minimum size ensure
//       if (photoType === 'stamp') {
//         payload.printMmWidth = Math.max(payload.printMmWidth, 50);
//         payload.printMmHeight = Math.max(payload.printMmHeight, 60);
//       }
//     } else {
//       payload.printMaxCount = 1;
//     }
//     // ==============================================================

//     const response = await axios.post(config.cutout_pro_api_url!, payload, {
//       headers: {
//         'APIKEY': config.cutout_pro_api_key,
//         'Content-Type': 'application/json',
//       },
//       timeout: 35000,
//     });

//     const result = response.data;

//     if (result.code === 0 && result.data) {
//       const singleImageUrl = result.data.idPhotoImage;
//       const printLayoutUrl = result.data.printLayoutImage || singleImageUrl;

//       if (!singleImageUrl) throw new Error('No image URL returned from Cutout Pro');

//       const [pngUrl, jpgUrl, webpUrl] = await Promise.all([
//         downloadAndSaveProcessedImage(singleImageUrl, userId, photoType, 'png'),
//         downloadAndSaveProcessedImage(singleImageUrl, userId, photoType, 'jpg'),
//         downloadAndSaveProcessedImage(singleImageUrl, userId, photoType, 'webp'),
//       ]);

//       photo.pngUrl = pngUrl;
//       photo.jpgUrl = jpgUrl;
//       photo.webpUrl = webpUrl;

//       photo.idPhotoImage = pngUrl;
//       photo.printLayoutImage = printLayoutUrl;

//       photo.status = PHOTO_STATUS.SUCCESS;
//       photo.creditsUsed = 1;
//       photo.expiresAt = new Date(Date.now() + 10 * 60 * 1000);

//       await photo.save();
//       return photo;
//     } else {
//       throw new Error(result.msg || 'Cutout Pro processing failed');
//     }
//   } catch (error: any) {
//     photo.status = PHOTO_STATUS.FAILED;
//     photo.errorMessage = error.message || 'Unknown error';
//     await photo.save();
//     throw error;
//   }
// };

const createPhotoToDB = async (
  data: Omit<PhotoInput, 'sizeInfo'> & {
    sizeInfo: { name: string; mmWidth: number; mmHeight: number };
  },
  userId: string,
  file?: Express.Multer.File
): Promise<PhotoDocument> => {
  const { originalImage, photoType, bgColor = 'FFFFFF', copies = 1, sizeInfo, paperSize = PAPER_SIZE.FOUR_R } = data;

  if (!file) throw new Error('No file provided');

  const photo = new Photo({
    userId,
    originalImage,
    country: 'Bangladesh',
    photoType,
    sizeInfo,
    bgColor,
    copies,
    status: 'processing',
    printOptions: {
      paperSize,
    },
  });

  await photo.save();

  let buffer: Buffer;
  if (file.buffer) buffer = file.buffer;
  else if (file.path) buffer = fs.readFileSync(file.path);
  else throw new Error('File buffer not found');

  const base64Image = bufferToBase64(buffer);
  const cleanBgColor = (bgColor || 'FFFFFF').replace('#', '').toUpperCase();

  try {
    const payload = {
      base64: base64Image,
      bgColor: cleanBgColor,
      dpi: 300,
      mmWidth: sizeInfo.mmWidth,
      mmHeight: sizeInfo.mmHeight,
    };

    const response = await axios.post(config.cutout_pro_api_url!, payload, {
      headers: {
        'APIKEY': config.cutout_pro_api_key,
        'Content-Type': 'application/json',
      },
      timeout: 35000,
    });

    const result = response.data;

    if (result.code !== 0 || !result.data?.idPhotoImage) {
      throw new Error(result.msg || 'Cutout Pro failed');
    }

    const singleImageUrl = result.data.idPhotoImage;

    const singleBuffer = await downloadImageAsBuffer(singleImageUrl);
    const layoutBuffer = await createPrintLayout(singleBuffer, sizeInfo, copies, paperSize);
    

    // All formats
    const singlePng = await downloadAndSaveProcessedImage(singleBuffer, userId, photoType, 'png');
    const layoutPng = await downloadAndSaveProcessedImage(layoutBuffer, userId, photoType, 'layout');

    const jpgUrl = await downloadAndSaveProcessedImage(layoutBuffer, userId, photoType, 'jpg');
    const webpUrl = await downloadAndSaveProcessedImage(layoutBuffer, userId, photoType, 'webp');

    photo.idPhotoImage = singlePng;
    photo.printLayoutImage = layoutPng;

    photo.pngUrl = singlePng;
    photo.jpgUrl = jpgUrl;
    photo.webpUrl = webpUrl;

    photo.status = PHOTO_STATUS.SUCCESS;
    photo.creditsUsed = 1;
    photo.expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    await photo.save();
    return photo;

  } catch (error: any) {
    photo.status = PHOTO_STATUS.FAILED;
    photo.errorMessage = error.message;
    await photo.save();
    throw error;
  }
};

export const PhotoServices={
    createPhotoToDB,
 
}