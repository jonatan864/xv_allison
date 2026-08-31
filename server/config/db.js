import mongoose from 'mongoose';
import { env } from './env.js';

export async function connectDb() {
  mongoose.set('strictQuery', true);

  try {
    await mongoose.connect(env.mongoUri, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000
    });
    console.log('MongoDB conectado');
  } catch (error) {
    console.error('Error de conexion con MongoDB:', error.message);
    if (error?.reason?.message) {
      console.error('Detalle MongoDB:', error.reason.message);
    }
    throw error;
  }
}
