import { connection } from './../../app/config/bull';
import { Worker } from 'bullmq';
import { emailHelper } from '../../app/helpers/emailHelper';
import { logger } from '../../app/shared/logger';

export const emailWorker = new Worker(
  'emailQueue',
  async (job) => {
    const { email, subject, body, replyTo } = job.data;
    await emailHelper.sendEmail({
      to: email,
      subject,
      html: body,
      replyTo: replyTo || email,
    });
  },
  { connection },
);

emailWorker.on('completed', (job) => {
  logger.info(`Email job completed ${job.id}`);
});

emailWorker.on('failed', (job) => {
  logger.error(`Email job failed ${job?.id}`);
});

emailWorker.on('error', (_err) => {
  // Avoid crashing if Redis is temporarily unreachable
});
