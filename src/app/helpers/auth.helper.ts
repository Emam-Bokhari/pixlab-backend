import auth from '../middlewares/auth';
import { USER_ROLE } from '../types/enum';

export const isUser = auth(USER_ROLE.USER);

export const isAdmin = auth(USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN);

export const isSuperAdmin = auth(USER_ROLE.SUPER_ADMIN);

export const isAuthenticated = auth(USER_ROLE.USER, USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN);
