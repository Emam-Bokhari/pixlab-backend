import { connection } from './../../app/config/bull';
import { Worker } from 'bullmq';
import { Photo } from '../../app/modules/photo/photo.model';
import { ensurePrintLayoutBuffer, processPhoto } from '../../app/modules/photo/photo.service';
import {
  downloadAndSaveProcessedImage,
  downloadAndSavePdf,
} from '../../app/modules/photo/photo.utils';
import { renderLayoutPdf } from '../../app/modules/photo/pdf/pdf.renderPdf';
import { logger } from '../../app/shared/logger';

export const photoWorker = new Worker(
  'photoQueue',
  async (job) => {
    if (job.name === 'processPhoto') {
      const { photoId, userId, bgColor, sizeInfo, filePath } = job.data;
      await processPhoto(photoId, userId, bgColor, sizeInfo, filePath);
      return { photoId, success: true };
    }

    if (job.name === 'regenerateFormats') {
      const { photoId, userId } = job.data;

      const photo = await Photo.findById(photoId);

      if (!photo || !photo.idPhotoImage) {
        throw new Error('Photo not found or base image not generated yet');
      }

      if (String(photo.userId) !== userId) {
        throw new Error('Not authorized to access this photo');
      }

      const { layoutBuffer, layout } = await ensurePrintLayoutBuffer(photo);

      const [jpgUrl, webpUrl] = await Promise.all([
        downloadAndSaveProcessedImage(layoutBuffer, String(photo.userId), photo.photoType, 'jpg'),
        downloadAndSaveProcessedImage(layoutBuffer, String(photo.userId), photo.photoType, 'webp'),
      ]);

      const pdfBuffer = await renderLayoutPdf(layoutBuffer, layout);
      const pdfUrl = await downloadAndSavePdf(pdfBuffer, String(photo.userId), photo.photoType);

      photo.jpgUrl = jpgUrl;
      photo.webpUrl = webpUrl;
      photo.pdfUrl = pdfUrl;

      await photo.save();

      return { photoId, success: true };
    }
  },
  { connection },
);

photoWorker.on('completed', (job) => {
  logger.info(`Photo job (${job.name}) completed ${job.id}`);
});

photoWorker.on('failed', (job, err) => {
  logger.error(`Photo job (${job?.name}) failed ${job?.id}: ${err.message}`);
});
