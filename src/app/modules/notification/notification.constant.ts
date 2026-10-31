export enum NOTIFICATION_TYPE {
  NEW_USER_REGISTRATION = 'new_user_registration',
  NEW_DONOR_REGISTRATION = 'new_donor_registration',
  USER_DELETED = 'user_deleted',
  NEW_BLOG_POST = 'new_blog_post',
  NEW_SUPPORT_REQUEST = 'new_support_request',
  SUPER_ADMIN = 'super_admin',
  USER = 'user',
}

export enum NOTIFICATION_REFERENCE_MODEL {
  MESSAGE = 'message',
  USER = 'user',
  BLOG = 'blog',
  SUPPORT = 'support',
}
