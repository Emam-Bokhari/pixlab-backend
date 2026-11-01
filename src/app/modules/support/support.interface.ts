import { SUPPORT_STATUS } from './support.constant';

export type TSupport = {
  name: string;
  email: string;
  subject: string;
  message: string;
  status?: SUPPORT_STATUS;
  isDeleted?: boolean;
};
