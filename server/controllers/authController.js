import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { Usuario } from '../models/Usuario.js';

function signToken(usuario) {
  return jwt.sign(
    {
      sub: usuario._id.toString(),
      rol: usuario.rol,
      email: usuario.email
    },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn }
  );
}

export async function login(req, res, next) {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');

    if (!email || !password) {
      return res.status(400).json({ message: 'Email y password son obligatorios' });
    }

    const usuario = await Usuario.findOne({ email, activo: true });

    if (!usuario || !(await usuario.comparePassword(password))) {
      return res.status(401).json({ message: 'Credenciales invalidas' });
    }

    return res.json({
      token: signToken(usuario),
      usuario: {
        _id: usuario._id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol
      }
    });
  } catch (error) {
    return next(error);
  }
}

export function me(req, res) {
  res.json({ usuario: req.usuario });
}
