import { Router } from 'express';
import {
  crearInvitado,
  editarInvitado,
  eliminarInvitado,
  listarInvitados,
  obtenerInvitado,
  validarQrController
} from '../controllers/invitadosController.js';
import { requireAuth } from '../middlewares/authMiddleware.js';
import { requireRole } from '../middlewares/roleMiddleware.js';

export const invitadosRoutes = Router();

invitadosRoutes.post('/validar-qr', requireAuth, requireRole('ADMIN', 'ACCESO'), validarQrController);
invitadosRoutes.get('/', requireAuth, requireRole('ADMIN'), listarInvitados);
invitadosRoutes.post('/', requireAuth, requireRole('ADMIN'), crearInvitado);
invitadosRoutes.get('/:id', requireAuth, requireRole('ADMIN'), obtenerInvitado);
invitadosRoutes.put('/:id', requireAuth, requireRole('ADMIN'), editarInvitado);
invitadosRoutes.delete('/:id', requireAuth, requireRole('ADMIN'), eliminarInvitado);
