import express from 'express';
import { pool } from './db/pool.js';
import { authRouter } from './modules/auth/auth.routes.js';
import { categoriasRouter } from './modules/categorias/categorias.routes.js';
import { reportesRouter } from './modules/reportes/reportes.routes.js';
import { errorHandler } from './middleware/errorHandler.js';
import { HttpError } from './utils/httpError.js';

// app.js DEFINE la aplicación (middlewares + rutas).
// index.js la ARRANCA (abre el puerto). Separado para poder probarla sin abrir puertos.
export const app = express();

app.use(express.json());

// Health check: confirma que Express y Postgres responden.
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ estado: 'ok', db: 'conectada' });
  } catch (err) {
    res.status(500).json({ estado: 'error', mensaje: err.message });
  }
});

// Cada módulo del monolito modular monta sus rutas bajo su prefijo.
app.use('/api/auth', authRouter);
app.use('/api/categorias', categoriasRouter);
app.use('/api/reportes', reportesRouter);

// Cualquier /api/... que no coincidió con nada → 404 en JSON.
app.use('/api', () => {
  throw new HttpError(404, 'Ruta no encontrada.');
});

// Siempre al final: recibe todos los errores.
app.use(errorHandler);
