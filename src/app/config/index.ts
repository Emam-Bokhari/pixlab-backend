import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

export default {
  port: process.env.PORT,
  ip: process.env.IP,
  node_env: process.env.NODE_ENV,
  frontend_url: process.env.FRONTEND_URL,
  bg_remover_api_url: process.env.BG_REMOVER_API_URL,
};
