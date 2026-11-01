import nodemailer from 'nodemailer';
import config from '../config';
import { errorLogger, logger } from '../shared/logger';
import { ISendEmail } from '../types/email';

const transporter = nodemailer.createTransport({
  host: config.email.host,
  port: Number(config.email.port),
  secure: false,
  auth: {
    user: config.email.user,
    pass: config.email.pass,
  },
});

const sendEmail = async (values: ISendEmail) => {
  try {
    const fromEmail = config.email.from;

    if (!fromEmail) {
      throw new Error('Sender email (from) is not defined in config or template.');
    }

    const formattedFrom = fromEmail.includes('<') ? fromEmail : `"PixLab" <${fromEmail}>`;

    const info = await transporter.sendMail({
      from: formattedFrom,
      to: values.to,
      subject: values.subject,
      html: values.html,
      replyTo: values.replyTo || fromEmail,
    });

    logger.info('Mail send successfully', info.accepted);
  } catch (error) {
    errorLogger.error('Email', error);
  }
};

export const emailHelper = {
  sendEmail,
};
