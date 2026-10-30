import { pool } from '../../db/pool.js';

// SELECT base reutilizado por todas las consultas de lectura.
// - ::float convierte NUMERIC a número (pg devuelve NUMERIC como string
//   para no perder precisión; para coordenadas un float sobra).
// - El nombre del autor se oculta en SQL cuando el reporte es anónimo.
const SELECT_REPORTE = `
  SELECT r.id, r.titulo, r.descripcion,
         r.latitud::float  AS latitud,
         r.longitud::float AS longitud,
         r.municipio, r.anonimo, r.estado, r.creado_en, r.actualizado_en,
         r.usuario_id,
         c.slug   AS categoria,
         c.nombre AS categoria_nombre,
         c.color  AS categoria_color,
         CASE WHEN r.anonimo THEN NULL ELSE u.nombre END AS autor
  FROM reportes r
  JOIN categorias c ON c.id = r.categoria_id
  JOIN usuarios   u ON u.id = r.usuario_id
`;

// Arma el WHERE según los filtros que lleguen. Cada valor va como
// parámetro ($1, $2...), nunca concatenado: así se evita la inyección SQL.
export async function listar({ categoria, estado, municipio, q, usuarioId, limite = 500 }) {
  const condiciones = [];
  const valores = [];
  const agregar = (sql, valor) => {
    valores.push(valor);
    // Cada "?" se cambia por el número del parámetro ($1, $2...).
    // Postgres permite usar el mismo $n varias veces en una consulta.
    condiciones.push(sql.replaceAll('?', `$${valores.length}`));
  };

  if (categoria) agregar('c.slug = ?', categoria);
  if (estado) agregar('r.estado = ?', estado);
  if (municipio) agregar('r.municipio = ?', municipio);
  if (usuarioId) agregar('r.usuario_id = ?', usuarioId);
  if (q) agregar('(r.titulo ILIKE ? OR r.municipio ILIKE ?)', `%${q}%`);

  const where = condiciones.length ? `WHERE ${condiciones.join(' AND ')}` : '';
  valores.push(limite);
  const { rows } = await pool.query(
    `${SELECT_REPORTE} ${where} ORDER BY r.creado_en DESC LIMIT $${valores.length}`,
    valores
  );
  return rows;
}

export async function buscarPorId(id, db = pool) {
  const { rows } = await db.query(`${SELECT_REPORTE} WHERE r.id = $1`, [id]);
  return rows[0] ?? null;
}

export async function historial(reporteId) {
  const { rows } = await pool.query(
    // Si el reporte es anónimo, también se oculta el nombre del ciudadano
    // en su propia fila del historial ("Reporte creado").
    `SELECT h.id, h.estado_anterior, h.estado_nuevo, h.observacion, h.creado_en,
            CASE WHEN r.anonimo AND h.usuario_id = r.usuario_id THEN NULL ELSE u.nombre END AS autor,
            u.rol AS autor_rol
     FROM historial_estados h
     JOIN usuarios u ON u.id = h.usuario_id
     JOIN reportes r ON r.id = h.reporte_id
     WHERE h.reporte_id = $1
     ORDER BY h.creado_en, h.id`,
    [reporteId]
  );
  return rows;
}

export async function categoriaExiste(slug) {
  const { rowCount } = await pool.query('SELECT 1 FROM categorias WHERE slug = $1', [slug]);
  return rowCount > 0;
}

// Las funciones de escritura reciben "db": el client de una transacción.
export async function crear(db, datos) {
  const { rows } = await db.query(
    `INSERT INTO reportes
       (usuario_id, categoria_id, titulo, descripcion, latitud, longitud, municipio, anonimo)
     VALUES ($1, (SELECT id FROM categorias WHERE slug = $2), $3, $4, $5, $6, $7, $8)
     RETURNING id`,
    [
      datos.usuarioId,
      datos.categoria,
      datos.titulo,
      datos.descripcion,
      datos.latitud,
      datos.longitud,
      datos.municipio,
      datos.anonimo,
    ]
  );
  return rows[0].id;
}

// FOR UPDATE bloquea la fila hasta que termine la transacción:
// si dos funcionarios cambian el estado a la vez, el segundo espera
// y ve el estado ya actualizado.
export async function estadoActualParaActualizar(db, id) {
  const { rows } = await db.query('SELECT estado FROM reportes WHERE id = $1 FOR UPDATE', [id]);
  return rows[0]?.estado ?? null;
}

export async function actualizarEstado(db, id, estado) {
  await db.query('UPDATE reportes SET estado = $1, actualizado_en = NOW() WHERE id = $2', [
    estado,
    id,
  ]);
}

export async function registrarHistorial(db, { reporteId, usuarioId, anterior, nuevo, observacion }) {
  await db.query(
    `INSERT INTO historial_estados (reporte_id, usuario_id, estado_anterior, estado_nuevo, observacion)
     VALUES ($1, $2, $3, $4, $5)`,
    [reporteId, usuarioId, anterior, nuevo, observacion ?? null]
  );
}

export async function resumen() {
  const { rows } = await pool.query(
    `SELECT COUNT(*)::int AS total,
            COUNT(*) FILTER (WHERE estado = 'recibido')::int   AS recibidos,
            COUNT(*) FILTER (WHERE estado = 'en_proceso')::int AS en_proceso,
            COUNT(*) FILTER (WHERE estado = 'resuelto')::int   AS resueltos
     FROM reportes`
  );
  return rows[0];
}
