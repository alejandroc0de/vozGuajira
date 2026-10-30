import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { HttpError } from '../utils/httpError.js';

// Lee el token del encabezado "Authorization: Bearer <token>".
function leerToken(req) {
  const header = req.headers.authorization || '';
  const [tipo, token] = header.split(' ');
  return tipo === 'Bearer' && token ? token : null;
}

// Si el token es válido, deja los datos del usuario en req.usuario.
function decodificar(token) {
  try {
    const payload = jwt.verify(token, config.jwtSecret);
    return { id: payload.sub, rol: payload.rol, nombre: payload.nombre };
  } catch {
    // Token vencido, alterado o firmado con otro secreto.
    throw new HttpError(401, 'Tu sesión expiró. Vuelve a iniciar sesión.');
  }
}

// Ruta protegida: sin token válido responde 401.
export function requireAuth(req, res, next) {
  const token = leerToken(req);
  if (!token) throw new HttpError(401, 'Debes iniciar sesión.');
  req.usuario = decodificar(token);
  next();
}

// Ruta pública que se comporta distinto si hay sesión
// (ej.: el detalle de un reporte muestra "Reportado por ti").
export function optionalAuth(req, res, next) {
  const token = leerToken(req);
  if (token) req.usuario = decodificar(token);
  next();
}

// Autorización por rol. Se usa DESPUÉS de requireAuth:
//   router.patch('/...', requireAuth, requireRol('autoridad', 'admin'), handler)
export function requireRol(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.usuario?.rol)) {
      throw new HttpError(403, 'No tienes permiso para esta acción.');
    }
    next();
  };
}
