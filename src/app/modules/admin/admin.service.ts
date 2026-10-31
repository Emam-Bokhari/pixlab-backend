import { HttpError } from '../../errors/HttpError';
import { USER_ROLE } from '../../types/enum';
import { User } from '../user/user.model';

const createAdminToDB = async (payload: any) => {
  const { email, password, ...rest } = payload;

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new HttpError(400, 'Admin already exists with this email');
  }

  const admin = await User.create({
    email,
    password,
    role: USER_ROLE.ADMIN,
    isActive: true,
    isVerified: true,
    ...rest,
  });

  return admin;
};

const getAllAdminsFromDB = async () => {
  const admins = await User.find({
    role: USER_ROLE.ADMIN,
  });

  if (!admins) {
    throw new HttpError(404, 'No admins found');
  }

  return admins;
};

const deleteAdminFromDB = async (id: string) => {
  const admin = await User.findById(id);

  if (!admin) {
    throw new HttpError(404, 'Admin not found');
  }

  if (admin.role !== USER_ROLE.ADMIN) {
    throw new HttpError(400, 'User is not an admin');
  }

  await User.findByIdAndUpdate(id, {
    isDeleted: true,
    isActive: false,
  });

  return admin;
};

export const AdminServices = {
  createAdminToDB,
  getAllAdminsFromDB,
  deleteAdminFromDB,
};
