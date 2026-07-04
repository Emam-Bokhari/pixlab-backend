import { connection } from './../../app/config/bull';
import { Worker } from "bullmq";
import { emailHelper } from "../../app/helpers/emailHelper";
import { logger } from "../../app/shared/logger";

export const emailWorker = new Worker("emailQueue", async (job) => {
    const { email, subject, body } = job.data;
    // send email
    await emailHelper.sendEmail({
        to: email,
        subject,
        html: body,
        replyTo: email
    });
}, { connection })

emailWorker.on('completed', (job) => {
    logger.info(`Email job completed ${job.id}`);
})

emailWorker.on('failed', (job) => {
    logger.error(`Email job failed ${job?.id}`);
})