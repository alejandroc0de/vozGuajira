import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../../config.js';
import { HttpError } from '../../utils/httpError.js';
import * as usuariosRepo from './usuarios.repository.js';

// Service: la lógica de negocio de autenticación.
// No sabe nada de Express (req/res) ni de SQL.

function firmarToken(usuario) {
  // "sub" (subject) es el nombre estándar en JWT para el id del usuario.
  return jwt.sign(
    { sub: usuario.id, rol: usuario.rol, nombre: usuario.nombre },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );
}

export async function registrar({ nombre, email, telefono, password }) {
  // 10 "rondas" de bcrypt: lo bastante lento para frenar ataques de fuerza bruta,
  // lo bastante rápido para que el registro no se sienta lento.
  const passwordHash = await bcrypt.hash(password, 10);
  const usuario = await usuariosRepo.crear({
    nombre,
    email: email ?? null,
    telefono: telefono ?? null,
    passwordHash,
  });
  return { usuario, token: firmarToken(usuario) };
}

export async function login({ identificador, password }) {
  const usuario = await usuariosRepo.buscarPorIdentificador(identificador);

  // Mismo mensaje si el usuario no existe o si la contraseña está mal:
  // así nadie puede averiguar qué correos están registrados.
  const valida = usuario && (await bcrypt.compare(password, usuario.password_hash));
  if (!valida) throw new HttpError(401, 'Correo/teléfono o contraseña incorrectos.');

  const { password_hash, ...publico } = usuario; // nunca devolver el hash
  return { usuario: publico, token: firmarToken(publico) };
}

export async function perfil(id) {
  const usuario = await usuariosRepo.buscarPorId(id);
  if (!usuario) throw new HttpError(404, 'Usuario no encontrado.');
  return usuario;
}
