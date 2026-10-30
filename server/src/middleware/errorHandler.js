import { ZodError } from 'zod';
import { HttpError } from '../utils/httpError.js';

// Middleware de errores: Express lo reconoce porque recibe 4 parámetros.
// Express 5 manda aquí cualquier error lanzado en una ruta, incluidas las async,
// así que las rutas no necesitan try/catch.
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  // Datos inválidos según el esquema de Zod → 400 con el detalle por campo.
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'Datos inválidos',
      detalles: err.issues.map((i) => ({ campo: i.path.join('.'), mensaje: i.message })),
    });
  }

  // Errores que lanzamos a propósito (404, 401, 403...).
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.message });
  }

  // Violación de UNIQUE en Postgres (ej.: correo ya registrado).
  if (err.code === '23505') {
    return res.status(409).json({ error: 'Ese correo o teléfono ya está registrado.' });
  }

  // JSON mal formado en el body.
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'El cuerpo de la petición no es JSON válido.' });
  }

  // Cualquier otra cosa es un bug: se registra completo y al cliente
  // se le da un mensaje genérico (no se filtran detalles internos).
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor.' });
}
