// Ejecuta en orden los archivos de db/migrations que todavía no se han corrido.
// Uso: npm run migrate
//
// - Guarda en la tabla "migraciones" qué archivos ya corrieron.
// - Cada archivo corre en su propia transacción: si falla, no queda a medias.
// - REGLA: una migración que ya corrió NUNCA se edita. Para cambiar algo,
//   se crea un archivo nuevo (006_...sql) con un ALTER TABLE.

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pool } from '../src/db/pool.js';

// En ES modules no existe __dirname; se calcula a partir de la URL del archivo.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const carpeta = path.join(__dirname, '..', 'db', 'migrations');

async function main() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS migraciones (
        nombre       TEXT PRIMARY KEY,
        ejecutada_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    const { rows } = await client.query('SELECT nombre FROM migraciones');
    const yaCorridas = new Set(rows.map((r) => r.nombre));

    // .sort() ordena por nombre: por eso los archivos empiezan con 001, 002...
    const archivos = (await fs.readdir(carpeta)).filter((f) => f.endsWith('.sql')).sort();
    const pendientes = archivos.filter((f) => !yaCorridas.has(f));

    if (pendientes.length === 0) {
      console.log('✔ La base de datos ya está al día.');
      return;
    }

    for (const archivo of pendientes) {
      const sql = await fs.readFile(path.join(carpeta, archivo), 'utf8');
      try {
        await client.query('BEGIN');
        await client.query(sql);
        await client.query('INSERT INTO migraciones (nombre) VALUES ($1)', [archivo]);
        await client.query('COMMIT');
        console.log(`✔ ${archivo}`);
      } catch (err) {
        await client.query('ROLLBACK');
        console.error(`✖ Falló ${archivo}: ${err.message}`);
        process.exitCode = 1;
        return; // no seguir con las siguientes: dependen de esta
      }
    }
    console.log(`Listo: ${pendientes.length} migración(es) aplicada(s).`);
  } finally {
    client.release();
    await pool.end(); // cierra el pool para que el script termine
  }
}

main().catch((err) => {
  console.error('Error de conexión:', err.message);
  process.exitCode = 1;
});
