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
 * Valida un QR y consume exactamente un acceso.
 *
 * La operación que incrementa accesosUsados se realiza
 * de forma atómica en MongoDB.
 */
export async function validarQr(qrToken) {
  const token = String(qrToken || '').trim();

  if (!token) {
    const error = new Error('qrToken es obligatorio');
    error.statusCode = 400;
    throw error;
  }

  const fechaEntrada = new Date();

  /*
   * IMPORTANTE:
   *
   * Solo encontramos el documento si:
   *
   * 1. El QR existe.
   * 2. Está VIGENTE.
   * 3. accesosUsados < pases.
   *
   * Entonces incrementamos accesosUsados de forma atómica.
   *
   * También calculamos el nuevo estado:
   *
   * accesosUsados + 1 >= pases
   *      -> CADUCADO
   *
   * en caso contrario:
   *      -> VIGENTE
   */
  const updated = await Invitado.findOneAndUpdate(
    {
      qrToken: token,
      estado: 'VIGENTE',
      $expr: {
        $lt: ['$accesosUsados', '$pases']
      }
    },
    [
      {
        $set: {
          accesosUsados: {
            $add: ['$accesosUsados', 1]
          },

          fechaEntrada,

          estado: {
            $cond: [
              {
                $gte: [
                  {
                    $add: ['$accesosUsados', 1]
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

  /*
   * Si updated existe, el acceso fue consumido correctamente.
   */
  if (updated) {
    const accesosUsados = updated.accesosUsados;
    const pases = updated.pases;
    const accesosRestantes = Math.max(
      pases - accesosUsados,
      0
    );

    return {
      resultado: 'ACCESO_PERMITIDO',
      mensaje: 'ACCESO PERMITIDO',
      accesosUsados,
      pases,
      accesosRestantes,
      invitado: updated
    };
  }

  /*
   * Si no se actualizó, averiguamos por qué.
   */
  const existing = await Invitado.findOne({
    qrToken: token
  });

  /*
   * QR inexistente.
   */
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

  const accesosUsados = Number(
    existing.accesosUsados || 0
  );

  const pases = Number(existing.pases || 0);

  const accesosRestantes = Math.max(
    pases - accesosUsados,
    0
  );

  /*
   * QR cancelado.
   */
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

  /*
   * QR caducado porque ya consumió todos los accesos.
   */
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

  /*
   * Cualquier otro caso inesperado.
   */
  return {
    resultado: 'QR_NO_VALIDO',
    mensaje: 'QR NO VALIDO',
    accesosUsados,
    pases,
    accesosRestantes,
    invitado: existing
  };
}