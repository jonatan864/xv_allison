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
    errors.push(
      'El nombre es obligatorio y debe tener al menos 2 caracteres'
    );
  }

  if (
    !Number.isInteger(payload.pases) ||
    payload.pases < 1 ||
    payload.pases > 20
  ) {
    errors.push(
      'Los pases deben ser un numero entero entre 1 y 20'
    );
  }

  if (payload.telefono && payload.telefono.length > 30) {
    errors.push(
      'El telefono no puede exceder 30 caracteres'
    );
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
    accesosUsados: 0,
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

  const invitado = await Invitado.findByIdAndUpdate(
    id,
    data,
    {
      new: true,
      runValidators: true
    }
  );

  if (!invitado) {
    const error = new Error('Invitado no encontrado');
    error.statusCode = 404;
    throw error;
  }

  // Si se modificaron los pases y ahora el invitado ya
  // alcanzó el límite, dejamos el QR caducado.
  if (invitado.accesosUsados >= invitado.pases) {
    invitado.estado = 'CADUCADO';
    await invitado.save();
  } else if (invitado.estado === 'CADUCADO') {
    invitado.estado = 'VIGENTE';
    await invitado.save();
  }

  return invitado;
}

/**
 * Consulta un QR sin consumir accesos.
 * Se utiliza antes de mostrar el selector de cantidad.
 */
export async function consultarQr(qrToken) {
  const token = String(qrToken || '').trim();

  if (!token) {
    const error = new Error('qrToken es obligatorio');
    error.statusCode = 400;
    throw error;
  }

  const existing = await Invitado.findOne({ qrToken: token });

  if (!existing) {
    return {
      resultado: 'QR_NO_VALIDO',
      mensaje: 'QR NO VALIDO',
      accesosUsados: 0,
      pases: 0,
      accesosRestantes: 0,
      invitado: null
    };
  }

  const accesosUsados = Number(existing.accesosUsados || 0);
  const pases = Number(existing.pases || 0);
  const accesosRestantes = Math.max(pases - accesosUsados, 0);

  if (existing.estado === 'CANCELADO') {
    return {
      resultado: 'QR_NO_VALIDO',
      mensaje: 'QR CANCELADO',
      accesosUsados,
      pases,
      accesosRestantes,
      invitado: existing
    };
  }

  if (
    existing.estado === 'CADUCADO' ||
    accesosUsados >= pases
  ) {
    return {
      resultado: 'QR_CADUCADO',
      mensaje: 'QR CADUCADO',
      accesosUsados,
      pases,
      accesosRestantes: 0,
      invitado: existing
    };
  }

  return {
    resultado: 'QR_DISPONIBLE',
    mensaje: 'QR DISPONIBLE',
    accesosUsados,
    pases,
    accesosRestantes,
    invitado: existing
  };
}

/**
 * Valida un QR y consume accesos.
 *
 * cantidad es opcional para conservar el comportamiento anterior:
 * validarQr(qrToken) sigue consumiendo exactamente 1 acceso.
 *
 * La operación que incrementa accesosUsados se realiza
 * de forma atómica en MongoDB y solo permite consumir la cantidad
 * solicitada si todos esos accesos siguen disponibles.
 */
export async function validarQr(qrToken, cantidad = 1) {
  const token = String(qrToken || '').trim();
  const cantidadAccesos = Number(cantidad);

  if (!token) {
    const error = new Error('qrToken es obligatorio');
    error.statusCode = 400;
    throw error;
  }

  if (
    !Number.isInteger(cantidadAccesos) ||
    cantidadAccesos < 1 ||
    cantidadAccesos > 20
  ) {
    const error = new Error('La cantidad de accesos debe ser un entero entre 1 y 20');
    error.statusCode = 400;
    throw error;
  }

  const fechaEntrada = new Date();

  /*
   * Solo encontramos el documento si:
   * 1. El QR existe.
   * 2. Está VIGENTE.
   * 3. Hay suficientes accesos para consumir la cantidad solicitada.
   *
   * El incremento es atómico para evitar que dos dispositivos consuman
   * simultáneamente más pases de los disponibles.
   */
  const updated = await Invitado.findOneAndUpdate(
    {
      qrToken: token,
      estado: 'VIGENTE',
      $expr: {
        $lte: [
          {
            $add: ['$accesosUsados', cantidadAccesos]
          },
          '$pases'
        ]
      }
    },
    [
      {
        $set: {
          accesosUsados: {
            $add: ['$accesosUsados', cantidadAccesos]
          },

          fechaEntrada,

          estado: {
            $cond: [
              {
                $gte: [
                  {
                    $add: ['$accesosUsados', cantidadAccesos]
                  },
                  '$pases'
                ]
              },
              'CADUCADO',
              'VIGENTE'
            ]
          }
        }
      }
    ],
    {
      new: true
    }
  );

  if (updated) {
    const accesosUsados = updated.accesosUsados;
    const pases = updated.pases;
    const accesosRestantes = Math.max(
      pases - accesosUsados,
      0
    );

    return {
      resultado: 'ACCESO_PERMITIDO',
      mensaje: cantidadAccesos === 1
        ? 'ACCESO PERMITIDO'
        : `${cantidadAccesos} ACCESOS PERMITIDOS`,
      cantidadAccesos,
      accesosUsados,
      pases,
      accesosRestantes,
      invitado: updated
    };
  }

  const existing = await Invitado.findOne({
    qrToken: token
  });

  if (!existing) {
    return {
      resultado: 'QR_NO_VALIDO',
      mensaje: 'QR NO VALIDO',
      cantidadAccesos,
      accesosUsados: 0,
      pases: 0,
      accesosRestantes: 0,
      invitado: null
    };
  }

  const accesosUsados = Number(
    existing.accesosUsados || 0
  );

  const pases = Number(existing.pases || 0);

  const accesosRestantes = Math.max(
    pases - accesosUsados,
    0
  );

  if (existing.estado === 'CANCELADO') {
    return {
      resultado: 'QR_NO_VALIDO',
      mensaje: 'QR CANCELADO',
      cantidadAccesos,
      accesosUsados,
      pases,
      accesosRestantes,
      invitado: existing
    };
  }

  if (
    existing.estado === 'CADUCADO' ||
    accesosUsados >= pases
  ) {
    return {
      resultado: 'QR_CADUCADO',
      mensaje: 'QR CADUCADO',
      cantidadAccesos,
      accesosUsados,
      pases,
      accesosRestantes: 0,
      invitado: existing
    };
  }

  // El QR sigue vigente, pero no hay suficientes pases para la cantidad solicitada.
  return {
    resultado: 'ACCESO_INSUFICIENTE',
    mensaje: `Solo hay ${accesosRestantes} ${accesosRestantes === 1 ? 'acceso disponible' : 'accesos disponibles'}`,
    cantidadAccesos,
    accesosUsados,
    pases,
    accesosRestantes,
    invitado: existing
  };
}
