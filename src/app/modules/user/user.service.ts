import bcrypt from 'bcrypt';
import { HttpError } from '../../errors/HttpError';
import { User } from './user.model';
import { USER_ROLE, USER_STATUS } from '../../types/enum';
import { Types } from 'mongoose';
import { TUser } from './user.interface';
import unlinkFile from '../../shared/unlinkFile';
import { sendRealtimeNotification } from '../../helpers/notificationHelper';
import { NOTIFICATION_TYPE } from '../notification/notification.constant';

const getAllUsersFromDB = async () => {
  const users = await User.find({
    role: USER_ROLE.USER,
  }).select('-password');

  return users;
};

const getUserByIdFromDB = async (userId: string) => {
  if (!Types.ObjectId.isValid(userId)) {
    throw new HttpError(400, 'Invalid user ID');
  }

  const user = await User.findOne({
    _id: userId,
    role: USER_ROLE.USER,
  }).select('-password');

  if (!user) {
    throw new HttpError(404, 'User not found');
  }

  return user;
};

const getUserProfileFromDB = async (userId: string): Promise<any> => {
  const isExistUser: any = await User.isExistUserById(userId);
  if (!isExistUser) {
    throw new HttpError(400, "User doesn't exist!");
  }

  const profile: any = { ...isExistUser.toObject() };
  return profile;
};

const updateProfileToDB = async (
  userId: string,
  payload: Partial<TUser>,
): Promise<Partial<TUser | null>> => {
  const isExistUser = await User.isExistUserById(userId);
  if (!isExistUser) {
    throw new HttpError(400, "User doesn't exist!");
  }

  //unlink file here
  if (payload.profileImage && isExistUser.profileImage) {
    await unlinkFile(isExistUser.profileImage);
  }

  const updateDoc = await User.findOneAndUpdate({ _id: userId }, payload, {
    new: true,
    runValidators: true,
  });

  return updateDoc;
};

const updateUserStatusByIdToDB = async (id: string, status: USER_STATUS.ACTIVE) => {
  if (![USER_STATUS.ACTIVE, USER_STATUS.BLOCKED].includes(status)) {
    throw new HttpError(400, "Status must be either 'ACTIVE' or 'BLOCKED'");
  }

  const user = await User.findOne({
    _id: id,
    role: USER_ROLE.USER,
  });
  if (!user) {
    throw new HttpError(404, 'No user is found by this user ID');
  }

  const result = await User.findByIdAndUpdate(id, { status }, { new: true });
  if (!result) {
    throw new HttpError(400, 'Failed to change status by this user ID');
  }

  return result;
};

const deleteUserByIdFromDB = async (userId: string) => {
  const user = await User.findOne({
    _id: userId,
    role: USER_ROLE.USER,
  });

  if (!user) {
    throw new HttpError(404, 'User doest not exist in the database');
  }

  const result = await User.findByIdAndDelete(userId);

  if (!result) {
    throw new HttpError(400, 'Failed to delete user by this ID');
  }

  return result;
};

const deleteProfileFromDB = async (userId: string, password: string) => {
  // user exists?
  const user = await User.findById(userId).select('+password');
  if (!user) {
    throw new HttpError(404, "User doesn't exist!");
  }

  // check password
  const isPasswordMatch = await bcrypt.compare(password, user.password!);
  if (!isPasswordMatch) {
    throw new HttpError(401, 'Password is incorrect!');
  }

  // delete user
  const result = await User.softDeleteById(userId);
  if (!result) {
    throw new HttpError(400, 'Failed to delete this user');
  }

  // Send notification to admin
  const admins = await User.find({
    role: { $in: [USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN] },
  }).select('_id');

  const adminIds = admins.map((admin) => admin._id.toString());

  if (adminIds.length > 0) {
    sendRealtimeNotification(adminIds, {
      title: 'User deleted',
      body: `${user.name} has deleted his account.`,
      type: NOTIFICATION_TYPE.USER_DELETED,
    });
  }

  return result;
};

export const UserServices = {
  getAllUsersFromDB,
  getUserByIdFromDB,
  getUserProfileFromDB,
  updateProfileToDB,
  updateUserStatusByIdToDB,
  deleteProfileFromDB,
  deleteUserByIdFromDB,
};
