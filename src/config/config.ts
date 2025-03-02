// src/config/config.ts
import { config as dotenvConfig } from 'dotenv';

dotenvConfig();

const config = {
  port: Number(process.env.APP_PORT) || 3011,
  host: process.env.APP_HOST || 'localhost',
  postgres: {
    host: process.env.POSTGRES_HOST || 'localhost',
    port: Number(process.env.POSTGRES_PORT) || 5435,
    username: process.env.POSTGRES_USER || 'your_postgres_user',
    password: process.env.POSTGRES_PASSWORD || 'mysecretpassword123',
    database: process.env.POSTGRES_DB || 'task_management_db',
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: Number(process.env.REDIS_PORT) || 6379,
  },
  jwt: {
    accessSecret:
      process.env.JWT_ACCESS_SECRET || 'your-very-secret-key-for-access-token',
    refreshSecret:
      process.env.JWT_REFRESH_SECRET || 'your_secure_refresh_secret_key',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '1h',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  oauth: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || 'example',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'example',
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID || 'example',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || 'example',
    },
  },
};

export default config;
