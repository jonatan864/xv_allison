import crypto from 'crypto';
import { Invitado } from '../models/Invitado.js';

export function createQrToken() {
  return `XV-${crypto.randomBytes(18).toString('hex')}`;
}

export async function createUniqueQrToken() {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const qrToken = createQrToken();
    const exists = await Invitado.exists({ qrToken });
    if (!exists) return qrToken;
  }

  throw new Error('No se pudo generar un token QR unico');
}
