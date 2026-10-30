import { pool } from '../../db/pool.js';

// Repository: el ÚNICO lugar donde está el SQL de usuarios.
// El service no sabe de SQL; solo llama a estas funciones.

const COLUMNAS_PUBLICAS = 'id, nombre, email, telefono, rol, creado_en';

export async function crear({ nombre, email, telefono, passwordHash }) {
  const { rows } = await pool.query(
    `INSERT INTO usuarios (nombre, email, telefono, password_hash)
     VALUES ($1, $2, $3, $4)
     RETURNING ${COLUMNAS_PUBLICAS}`,
    [nombre, email, telefono, passwordHash]
  );
  return rows[0];
}

// Busca por correo o por teléfono (el login acepta cualquiera de los dos).
// Esta sí devuelve password_hash, porque el login necesita compararlo.
export async function buscarPorIdentificador(identificador) {
  const { rows } = await pool.query(
    `SELECT ${COLUMNAS_PUBLICAS}, password_hash
     FROM usuarios
     WHERE email = $1 OR telefono = $1`,
    [identificador]
  );
  return rows[0] ?? null;
}

export async function buscarPorId(id) {
  const { rows } = await pool.query(
    `SELECT ${COLUMNAS_PUBLICAS} FROM usuarios WHERE id = $1`,
    [id]
  );
  return rows[0] ?? null;
}
