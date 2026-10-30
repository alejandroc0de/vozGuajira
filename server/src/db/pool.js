import pg from 'pg';
import { config } from '../config.js';

// pg es CommonJS: se importa el objeto completo y se desestructura.
const { Pool } = pg;

// Un solo Pool para toda la app. Mantiene varias conexiones abiertas
// y presta una a cada consulta. Todos los repositories importan este mismo objeto.
export const pool = new Pool({ connectionString: config.databaseUrl });

// Ejecuta una función dentro de una transacción.
// Si la función lanza un error, se hace ROLLBACK y nada queda a medias.
// Se usa cuando hay que escribir en varias tablas a la vez
// (ej.: crear un reporte + su primera fila de historial).
export async function enTransaccion(fn) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const resultado = await fn(client);
    await client.query('COMMIT');
    return resultado;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release(); // devuelve la conexión al pool, pase lo que pase
  }
}
