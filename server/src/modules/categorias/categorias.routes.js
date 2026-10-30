import { Router } from 'express';
import { pool } from '../../db/pool.js';

// Módulo pequeño: solo lectura, así que la consulta va directo aquí.
// Si crece (RF15: crear/editar categorías), se separa en service + repository.
export const categoriasRouter = Router();

// GET /api/categorias
categoriasRouter.get('/', async (req, res) => {
  const { rows } = await pool.query('SELECT id, slug, nombre, color FROM categorias ORDER BY id');
  res.json({ categorias: rows });
});
