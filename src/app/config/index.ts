import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

export default {
  port: process.env.PORT,
  database_url: process.env.DATABASE_URL,
  node_env: process.env.NODE_ENV,
  support_email: process.env.SUPPORT_EMAIL,
  frontend_url: process.env.FRONTEND_URL,
  redis: {
    redis_host: process.env.REDIS_HOST,
    redis_port: process.env.REDIS_PORT,
    redis_password: process.env.REDIS_PASSWORD,
    redis_db: process.env.REDIS_DB,
  },
  email: {
    from: process.env.EMAIL_FROM,
    user: process.env.EMAIL_USER,
    port: process.env.EMAIL_PORT,
    host: process.env.EMAIL_HOST,
    pass: process.env.EMAIL_PASS,
  },
  resend_api_key: process.env.RESEND_API_KEY,
  default_email_from: process.env.DEFAULT_EMAIL_FROM,
  bg_remover_api_url: process.env.BG_REMOVER_API_URL,
};
