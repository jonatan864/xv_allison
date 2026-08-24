import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { Usuario } from '../models/Usuario.js';

export async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const [scheme, token] = header.split(' ');

    if (scheme !== 'Bearer' || !token) {
      return res.status(401).json({ message: 'Token de autenticacion requerido' });
    }

    const payload = jwt.verify(token, env.jwtSecret);
    const usuario = await Usuario.findById(payload.sub).select('_id nombre email rol activo');

    if (!usuario || !usuario.activo) {
      return res.status(401).json({ message: 'Usuario no autorizado' });
    }

    req.usuario = usuario;
    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Token invalido o expirado' });
  }
}
