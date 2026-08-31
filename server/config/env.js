import dotenv from 'dotenv';

dotenv.config();

function cleanEnvValue(value) {
  return String(value ?? '')
    .trim()
    .replace(/^['"]|['"]$/g, '')
    .trim();
}

function parseCorsOrigins(value) {
  return cleanEnvValue(value)
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

const mongoUri = cleanEnvValue(process.env.MONGO_URI);

export const env = {
  nodeEnv: cleanEnvValue(process.env.NODE_ENV) || 'development',
  port: Number(process.env.PORT) || 4000,
  // En producción MONGO_URI debe venir de Render. No se guarda ninguna
  // credencial de MongoDB en el repositorio.
  mongoUri: mongoUri || 'mongodb://127.0.0.1:27017/xv_allison',
  jwtSecret: cleanEnvValue(process.env.JWT_SECRET) || 'dev_change_this_secret',
  jwtExpiresIn: cleanEnvValue(process.env.JWT_EXPIRES_IN) || '8h',
  corsOrigins: parseCorsOrigins(process.env.CORS_ORIGIN || 'http://localhost:5173'),
  seedAdminEmail: cleanEnvValue(process.env.SEED_ADMIN_EMAIL),
  seedAdminPassword: cleanEnvValue(process.env.SEED_ADMIN_PASSWORD),
  seedAccessEmail: cleanEnvValue(process.env.SEED_ACCESS_EMAIL),
  seedAccessPassword: cleanEnvValue(process.env.SEED_ACCESS_PASSWORD)
};

export function assertProductionEnv() {
  if (env.nodeEnv !== 'production') return;

  const missing = [];
  if (!process.env.MONGO_URI?.trim()) missing.push('MONGO_URI');
  if (!process.env.JWT_SECRET?.trim()) missing.push('JWT_SECRET');
  if (!process.env.CORS_ORIGIN?.trim()) missing.push('CORS_ORIGIN');

  if (missing.length > 0) {
    throw new Error(`Faltan variables obligatorias en produccion: ${missing.join(', ')}`);
  }

  if (!/^mongodb(?:\+srv)?:\/\//i.test(env.mongoUri)) {
    throw new Error('MONGO_URI no tiene un formato valido. Debe comenzar con mongodb:// o mongodb+srv://');
  }
}
