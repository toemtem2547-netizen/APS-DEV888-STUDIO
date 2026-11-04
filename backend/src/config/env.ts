import dotenv from 'dotenv';
dotenv.config();

export const ENV = {
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  DB_HOST: process.env.DB_HOST || '127.0.0.1',
  DB_PORT: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
  DB_USER: process.env.DB_USER || 'root',
  DB_PASSWORD: process.env.DB_PASSWORD || '12345678',
  DB_NAME: process.env.DB_NAME || 'game_topup_platform',
  JWT_SECRET: process.env.JWT_SECRET || 'topup_platform_jwt_secret_token_secure_2026_xyz!',
  ADMIN_JWT_SECRET: process.env.ADMIN_JWT_SECRET || 'topup_platform_admin_jwt_secret_token_secure_2026_abc!',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
  BACKOFFICE_URL: process.env.BACKOFFICE_URL || 'http://localhost:5174',
};
