import dotenv from 'dotenv';

dotenv.config();

function parseCorsOrigins(value) {
  return String(value || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 4000,
  mongoUri: process.env.MONGO_URI || 'mongodb+srv://2236000300_db_user:<BRLzrz8lza00zWAf>@xv-allison.ykh4ndy.mongodb.net/?appName=xv-allison',
  jwtSecret: process.env.JWT_SECRET || 'dev_change_this_secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '8h',
  corsOrigins: parseCorsOrigins(process.env.CORS_ORIGIN || 'http://localhost:5173'),
  seedAdminEmail: process.env.SEED_ADMIN_EMAIL || '',
  seedAdminPassword: process.env.SEED_ADMIN_PASSWORD || '',
  seedAccessEmail: process.env.SEED_ACCESS_EMAIL || '',
  seedAccessPassword: process.env.SEED_ACCESS_PASSWORD || ''
};

export function assertProductionEnv() {
  if (env.nodeEnv !== 'production') return;

  const missing = [];
  if (!process.env.MONGO_URI) missing.push('MONGO_URI');
  if (!process.env.JWT_SECRET) missing.push('JWT_SECRET');
  if (!process.env.CORS_ORIGIN) missing.push('CORS_ORIGIN');

  if (missing.length > 0) {
    throw new Error(`Faltan variables obligatorias en produccion: ${missing.join(', ')}`);
  }
}
