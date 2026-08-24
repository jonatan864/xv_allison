import { env } from '../config/env.js';
import { Usuario } from '../models/Usuario.js';

async function seedUser({ nombre, email, password, rol }) {
  if (!email || !password) return;

  const exists = await Usuario.exists({ email: email.toLowerCase() });
  if (exists) return;

  const passwordHash = await Usuario.hashPassword(password);
  await Usuario.create({
    nombre,
    email,
    passwordHash,
    rol
  });

  console.log(`Usuario ${rol} inicial creado: ${email}`);
}

export async function seedInitialUsers() {
  await seedUser({
    nombre: 'Administrador',
    email: env.seedAdminEmail,
    password: env.seedAdminPassword,
    rol: 'ADMIN'
  });

  await seedUser({
    nombre: 'Acceso',
    email: env.seedAccessEmail,
    password: env.seedAccessPassword,
    rol: 'ACCESO'
  });
}
