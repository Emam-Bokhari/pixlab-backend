import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

export default {
  port: process.env.PORT,
  database_url: process.env.DATABASE_URL,
  node_env: process.env.NODE_ENV,
  super_admin_password: process.env.SUPER_ADMIN_PASSWORD,
  super_admin_email: process.env.SUPER_ADMIN_EMAIL,
  support_email: process.env.SUPPORT_EMAIL,
  max_otp_attempts: process.env.MAX_OTP_ATTEMPTS,
  frontend_url: process.env.FRONTEND_URL,
  redis: {
    redis_host: process.env.REDIS_HOST,
    redis_port: process.env.REDIS_PORT,
    redis_password: process.env.REDIS_PASSWORD,
    redis_db: process.env.REDIS_DB,
  },
  firebase: {
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY,
    projectId: process.env.FIREBASE_PROJECT_ID,
  },
  email: {
    from: process.env.EMAIL_FROM,
    user: process.env.EMAIL_USER,
    port: process.env.EMAIL_PORT,
    host: process.env.EMAIL_HOST,
    pass: process.env.EMAIL_PASS,
  },
  jwt: {
    jwt_secret: process.env.JWT_SECRET,
    jwt_expire_in: process.env.JWT_EXPIRE_IN,
    jwt_refresh_secret: process.env.JWT_REFRESH_SECRET,
    jwt_refresh_expire_in: process.env.JWT_REFRESH_EXPIRE_IN,
  },
  uddoktapay: {
    api_key: process.env.UDDOKTAPAY_API_KEY,
    base_url: process.env.UDDOKTAPAY_BASE_URL,
    redirect_url: process.env.UDDOKTAPAY_REDIRECT_URL,
    cancel_url: process.env.UDDOKTAPAY_CANCEL_URL,
    webhook_url: process.env.UDDOKTAPAY_WEBHOOK_URL,
  },
  bcrypt_salt_rounds: process.env.BCRYPT_SALT_ROUNDS,
  otp_salt_rounds: process.env.OTP_SALT_ROUNDS,
  otp_length: process.env.OTP_LENGTH,
  resend_api_key: process.env.RESEND_API_KEY,
  default_email_from: process.env.DEFAULT_EMAIL_FROM,
  cutout_pro_api_key: process.env.CUTOUT_PRO_API_KEY,
  cutout_pro_api_url: process.env.CUTOUT_PRO_API_URL,
  cutout_pro_upscale_api_url: process.env.CUTOUT_PRO_UPSCALE_API_URL,
};
