import { enTransaccion } from '../../db/pool.js';
import { HttpError } from '../../utils/httpError.js';
import { TRANSICIONES } from '../../constants/municipios.js';
import * as repo from './reportes.repository.js';

// Quita usuario_id antes de responder: el id del autor nunca sale
// de la API. En su lugar se agrega "es_mio" para quien pregunta.
function aPublico(reporte, usuarioActualId) {
  const { usuario_id, ...resto } = reporte;
  return { ...resto, es_mio: usuarioActualId != null && usuario_id === usuarioActualId };
}

export async function listar(filtros, usuarioActualId) {
  const reportes = await repo.listar(filtros);
  return reportes.map((r) => aPublico(r, usuarioActualId));
}

export async function listarMios(usuarioId, filtros) {
  const reportes = await repo.listar({ ...filtros, usuarioId });
  return reportes.map((r) => aPublico(r, usuarioId));
}

export async function detalle(id, usuarioActualId) {
  const reporte = await repo.buscarPorId(id);
  if (!reporte) throw new HttpError(404, 'El reporte no existe.');
  const historial = await repo.historial(id);
  return { ...aPublico(reporte, usuarioActualId), historial };
}

// Crear un reporte escribe en DOS tablas (reportes + historial_estados).
// Va en una transacción: o se guardan las dos, o ninguna.
export async function crear(datos, usuarioId) {
  if (!(await repo.categoriaExiste(datos.categoria))) {
    throw new HttpError(400, 'La categoría no existe.');
  }
  const id = await enTransaccion(async (db) => {
    const nuevoId = await repo.crear(db, { ...datos, usuarioId });
    await repo.registrarHistorial(db, {
      reporteId: nuevoId,
      usuarioId,
      anterior: null,
      nuevo: 'recibido',
      observacion: 'Reporte creado',
    });
    return nuevoId;
  });
  return detalle(id, usuarioId);
}

// Máquina de estados: solo se permiten las transiciones de TRANSICIONES.
export async function cambiarEstado(id, { estado, observacion }, usuario) {
  await enTransaccion(async (db) => {
    const actual = await repo.estadoActualParaActualizar(db, id);
    if (!actual) throw new HttpError(404, 'El reporte no existe.');
    if (actual === estado) throw new HttpError(400, 'El reporte ya está en ese estado.');
    if (!TRANSICIONES[actual].includes(estado)) {
      throw new HttpError(400, `No se puede pasar de "${actual}" a "${estado}".`);
    }
    await repo.actualizarEstado(db, id, estado);
    await repo.registrarHistorial(db, {
      reporteId: id,
      usuarioId: usuario.id,
      anterior: actual,
      nuevo: estado,
      observacion,
    });
  });
  return detalle(id, usuario.id);
}

export function resumen() {
  return repo.resumen();
}
