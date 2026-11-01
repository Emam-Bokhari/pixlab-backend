import config from '../../config';
import { emailTemplate } from '../../shared/emailTemplate';
import { TSupport } from './support.interface';
import { emailQueue } from '../../../queues';
import { emailHelper } from '../../helpers/emailHelper';
import { logger, errorLogger } from '../../shared/logger';

const sendSupportMessage = async (payload: TSupport) => {
  const emailContent = emailTemplate.supportFormTemplate(payload);
  const recipientEmail = config.support_email || 'support@example.com';

  const emailData = {
    email: recipientEmail,
    replyTo: payload.email,
    subject: emailContent.subject || `Support Request from ${payload.name}`,
    body: emailContent.html,
  };

  try {
    // Attempt sending via queue if Redis is running
    await emailQueue.add('sendSupportEmail', emailData);
    logger.info('Support email added to queue');
  } catch (queueError) {
    // Fallback: send directly via nodemailer if queue is offline
    logger.info('Queue unavailable, sending email directly via nodemailer');
    try {
      await emailHelper.sendEmail({
        to: emailData.email,
        replyTo: emailData.replyTo,
        subject: emailData.subject,
        html: emailData.body,
      });
    } catch (mailError) {
      errorLogger.error('Failed to send support email directly', mailError);
    }
  }

  return {
    name: payload.name,
    email: payload.email,
    subject: payload.subject,
    message: payload.message,
    sentAt: new Date(),
  };
};

export const SupportServices = {
  createSupportToDB: sendSupportMessage,
  sendSupportMessage,
};
