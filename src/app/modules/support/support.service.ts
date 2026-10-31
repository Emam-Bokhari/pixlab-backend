import mongoose from 'mongoose';
import QueryBuilder from '../../buiilder/QueryBuilder';
import { HttpError } from '../../errors/HttpError';
import { emailHelper } from '../../helpers/emailHelper';
import { sendPushNotification } from '../../helpers/pushNotificationHelper';
import { emailTemplate } from '../../shared/emailTemplate';
import { USER_ROLE } from '../../types/enum';
import { NOTIFICATION_TYPE } from '../notification/notification.constant';
import { User } from '../user/user.model';
import { SUPPORT_STATUS } from './support.constant';
import { TSupport } from './support.interface';
import { Support } from './support.model';
import { emailQueue } from '../../../queues';

const createSupportToDB = async (payload: TSupport, userId?: string) => {
  if (userId) {
    payload.userId = new mongoose.Types.ObjectId(userId);
  }
  const result = await Support.create(payload);

  if (!result) {
    throw new Error('Support request creation failed');
  }

  // await emailHelper.sendEmail(emailTemplate.supportFormTemplate(payload));
  await emailQueue.add('sendSupportEmail', {
    email: payload.email,
    subject: 'BloodBridge Support Request',
    body: emailTemplate.supportFormTemplate(payload).html,
  });

  // send push notification to admins
  const admins = await User.find({
    role: { $in: [USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN] },
  }).select('_id');

  const adminIds = admins.map((admin) => admin._id.toString());

  if (adminIds.length > 0) {
    await sendPushNotification(adminIds, {
      title: 'New support request',
      body: `New support request from ${payload.name}: ${payload.subject}`,
      type: NOTIFICATION_TYPE.NEW_SUPPORT_REQUEST,
      data: {
        supportId: result._id.toString(),
      },
    });
  }

  return result;
};

const getAllSupportsFromDB = async (query: any) => {
  const baseQuery = Support.find().populate({
    path: 'userId',
    select: '_id firstName lastName email profileImage',
  });

  const queryBuilder = new QueryBuilder(baseQuery, query)
    .search(['name', 'subject', 'email'])
    .sort()
    .fields()
    .filter()
    .paginate();

  const supports = await queryBuilder.modelQuery;

  const meta = await queryBuilder.countTotal();

  if (!supports || supports.length === 0) {
    return {
      data: [],
      meta,
    };
  }

  return {
    data: supports,
    meta,
  };
};

const getSupportByIdFromDB = async (supportId: string) => {
  const support = await Support.findById(supportId).populate({
    path: 'userId',
    select: 'firstName lastName email profileImage',
  });

  if (!support) {
    throw new Error('No support request found with the given ID');
  }

  return support;
};

const updateSupportStatusByIdToDB = async (supportId: string, status: SUPPORT_STATUS) => {
  // validation: only allow specific statuses
  if (![SUPPORT_STATUS.RESOLVED, SUPPORT_STATUS.IN_PROGRESS].includes(status)) {
    throw new HttpError(400, 'Invalid support status update request');
  }

  const support = await Support.findById(supportId);

  if (!support) {
    throw new HttpError(404, 'Support not found');
  }

  support.status = status;

  await support.save();

  return support;
};

const deleteSupportByIdToDB = async (supportId: string) => {
  const result = await Support.findOneAndUpdate(
    { _id: supportId, isDeleted: false },
    { isDeleted: true },
    { new: true },
  );

  if (!result) {
    throw new HttpError(404, 'No support request found with the given ID');
  }

  return result;
};

export const SupportServices = {
  createSupportToDB,
  getAllSupportsFromDB,
  getSupportByIdFromDB,
  updateSupportStatusByIdToDB,
  deleteSupportByIdToDB,
};
