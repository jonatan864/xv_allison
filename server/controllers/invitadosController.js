import { Invitado } from '../models/Invitado.js';
import { createInvitado, updateInvitado, consultarQr, validarQr } from '../services/invitadosService.js';
import { emitEvent } from '../services/socketService.js';

export async function crearInvitado(req, res, next) {
  try {
    const invitado = await createInvitado(req.body);
    emitEvent('invitado_creado', invitado);
    res.status(201).json({ data: invitado });
  } catch (error) {
    next(error);
  }
}

export async function listarInvitados(req, res, next) {
  try {
    const invitados = await Invitado.find().sort({ fechaRegistro: -1 });
    res.json({ data: invitados });
  } catch (error) {
    next(error);
  }
}

export async function obtenerInvitado(req, res, next) {
  try {
    const invitado = await Invitado.findById(req.params.id);

    if (!invitado) {
      return res.status(404).json({ message: 'Invitado no encontrado' });
    }

    return res.json({ data: invitado });
  } catch (error) {
    return next(error);
  }
}

export async function editarInvitado(req, res, next) {
  try {
    const invitado = await updateInvitado(req.params.id, req.body);
    emitEvent('invitado_actualizado', invitado);
    res.json({ data: invitado });
  } catch (error) {
    next(error);
  }
}

export async function eliminarInvitado(req, res, next) {
  try {
    const invitado = await Invitado.findByIdAndDelete(req.params.id);

    if (!invitado) {
      return res.status(404).json({ message: 'Invitado no encontrado' });
    }

    emitEvent('invitado_eliminado', { _id: invitado._id });
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
}

export async function consultarQrController(req, res, next) {
  try {
    const result = await consultarQr(req.body.qrToken);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function validarQrController(req, res, next) {
  try {
    const result = await validarQr(
      req.body.qrToken,
      req.body.cantidad ?? 1
    );

    if (result.resultado === 'ACCESO_PERMITIDO') {
      emitEvent('invitado_validado', result.invitado);
      emitEvent('invitado_actualizado', result.invitado);
    }

    res.json(result);
  } catch (error) {
    next(error);
  }
}
