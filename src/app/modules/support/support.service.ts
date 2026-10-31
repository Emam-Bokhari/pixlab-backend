import { emailTemplate } from '../../shared/emailTemplate';
import { TSupport } from './support.interface';
import { Support } from './support.model';
import { emailQueue } from '../../../queues';

const createSupportToDB = async (payload: TSupport) => {
  const result = await Support.create(payload);

  if (!result) {
    throw new Error('Support request creation failed');
  }

  await emailQueue.add('sendSupportEmail', {
    email: payload.email,
    subject: 'AiSnapStudio Support Request',
    body: emailTemplate.supportFormTemplate(payload).html,
  });

  return result;
};

export const SupportServices = {
  createSupportToDB,
};
