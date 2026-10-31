import bcrypt from 'bcrypt';
import config from '../config/index';
import { User } from '../modules/user/user.model';
import { USER_ROLE } from '../types/enum';

const seedSuperAdmin = async () => {
  if (!config.super_admin_password || !config.super_admin_email) {
    throw new Error('Super admin password or email is not defined');
  }

  const isSuperAdminExists = await User.findOne({
    role: USER_ROLE.SUPER_ADMIN,
  });

  if (!isSuperAdminExists) {
    const hashedPassword = await bcrypt.hash(
      config.super_admin_password,
      Number(config.bcrypt_salt_rounds),
    );

    const admin = await User.create({
      name: 'Moshfiqur Rahman',
      email: config.super_admin_email,
      password: hashedPassword,
      role: USER_ROLE.SUPER_ADMIN,
      isVerified: true,
      isDeleted: false,
    });

    console.log('✅ Super Admin created successfully:', {
      id: admin._id,
      email: admin.email,
    });
  } else {
    console.log('ℹ️  Super Admin already exists, skipping seeding.');
  }
};

export default seedSuperAdmin;
