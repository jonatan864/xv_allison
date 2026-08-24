import { Invitado } from '../models/Invitado.js';
import { createUniqueQrToken } from './qrTokenService.js';

export function normalizeInvitadoPayload(payload) {
  return {
    nombre: String(payload.nombre || '').trim(),
    telefono: String(payload.telefono || '').trim(),
    pases: Number(payload.pases)
  };
}

export function validateInvitadoPayload(payload) {
  const errors = [];

  if (!payload.nombre || payload.nombre.length < 2) {
    errors.push('El nombre es obligatorio y debe tener al menos 2 caracteres');
  }

  if (!Number.isInteger(payload.pases) || payload.pases < 1 || payload.pases > 20) {
    errors.push('Los pases deben ser un numero entero entre 1 y 20');
  }

  if (payload.telefono && payload.telefono.length > 30) {
    errors.push('El telefono no puede exceder 30 caracteres');
  }

  return errors;
}

export async function createInvitado(payload) {
  const data = normalizeInvitadoPayload(payload);
  const errors = validateInvitadoPayload(data);

  if (errors.length > 0) {
    const error = new Error(errors.join('. '));
    error.statusCode = 400;
    throw error;
  }

  const qrToken = await createUniqueQrToken();

  return Invitado.create({
    ...data,
    qrToken,
    estado: 'VIGENTE',
    fechaRegistro: new Date(),
    fechaEntrada: null
  });
}

export async function updateInvitado(id, payload) {
  const data = normalizeInvitadoPayload(payload);
  const errors = validateInvitadoPayload(data);

  if (errors.length > 0) {
    const error = new Error(errors.join('. '));
    error.statusCode = 400;
    throw error;
  }

  const invitado = await Invitado.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true
  });

  if (!invitado) {
    const error = new Error('Invitado no encontrado');
    error.statusCode = 404;
    throw error;
  }

  return invitado;
}

export async function validarQr(qrToken) {
  const token = String(qrToken || '').trim();

  if (!token) {
    const error = new Error('qrToken es obligatorio');
    error.statusCode = 400;
    throw error;
  }

  const fechaEntrada = new Date();

  const updated = await Invitado.findOneAndUpdate(
    { qrToken: token, estado: 'VIGENTE' },
    { $set: { estado: 'USADO', fechaEntrada } },
    { new: true }
  );

  if (updated) {
    return {
      resultado: 'ACCESO_PERMITIDO',
      mensaje: 'ACCESO PERMITIDO',
      invitado: updated
    };
  }

  const existing = await Invitado.findOne({ qrToken: token });

  if (!existing) {
    return {
      resultado: 'QR_NO_VALIDO',
      mensaje: 'QR NO VALIDO',
      invitado: null
    };
  }

  if (existing.estado === 'USADO') {
    return {
      resultado: 'PASE_YA_UTILIZADO',
      mensaje: 'PASE YA UTILIZADO',
      invitado: existing
    };
  }

  return {
    resultado: 'QR_NO_VALIDO',
    mensaje: 'QR NO VALIDO',
    invitado: existing
  };
}
