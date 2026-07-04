import axios from 'axios';
import { Photo } from './photo.model';
import { bufferToBase64 } from './photo.utils';
import { PHOTO_STATUS } from './photo.constant';
import { PhotoDocument, PhotoInput } from './photo.interface';
import config from '../../config';

const createPhotoToDB = async (
  data: Omit<PhotoInput, 'sizeInfo'> & {
    file: Express.Multer.File; 
    sizeInfo: { name: string; mmWidth: number; mmHeight: number };
  },
  userId: string
): Promise<PhotoDocument> => {
  const { originalImage, photoType, bgColor = 'FFFFFF', copies, file, sizeInfo } = data;

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


    const base64Image = bufferToBase64(file.buffer, file.mimetype);

    const payload = {
      base64: base64Image,
      bgColor: photo.bgColor,
      dpi: 300,
      mmWidth: sizeInfo.mmWidth,
      mmHeight: sizeInfo.mmHeight,
      printBgColor: photo.bgColor,    
      printMmWidth: 0,
      printMmHeight: 0,
      printMaxCount: photo.copies,
    };

    if ((photo.copies ?? 1) > 1) {
      payload.printMmWidth = sizeInfo.mmWidth * 4;
      payload.printMmHeight = sizeInfo.mmHeight * 3;
    }

    const response = await axios.post(config.cutout_pro_api_url!, payload, {
      headers: {
        'APIKEY': config.cutout_pro_api_key,
        'Content-Type': 'application/json',
      },
      timeout: 35000,
    });

    const result = response.data;

    if (result.code === 0 && result.data) {
      photo.idPhotoImage = result.data.idPhotoImage;
      photo.printLayoutImage = result.data.printLayoutImage || result.data.idPhotoImage;
      photo.status = PHOTO_STATUS.SUCCESS;
      photo.creditsUsed = 1;
      photo.expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    } else {
      throw new Error(result.msg || 'Cutout Pro processing failed');
    }

    await photo.save();
    return photo;

  
};

export const PhotoServices={
    createPhotoToDB,
}