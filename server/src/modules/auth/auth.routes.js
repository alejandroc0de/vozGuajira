import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { registroSchema, loginSchema } from './auth.schemas.js';
import * as authService from './auth.service.js';

// Rutas: solo traducen HTTP ↔ service.
// 1) validan la entrada con Zod  2) llaman al service  3) responden.
// Si algo falla, el error sube solo al errorHandler (Express 5).
export const authRouter = Router();

// POST /api/auth/registro
authRouter.post('/registro', async (req, res) => {
  const datos = registroSchema.parse(req.body);
  const resultado = await authService.registrar(datos);
  res.status(201).json(resultado);
});

// POST /api/auth/login
authRouter.post('/login', async (req, res) => {
  const datos = loginSchema.parse(req.body);
  const resultado = await authService.login(datos);
  res.json(resultado);
});

// GET /api/auth/yo  → datos del usuario con sesión
authRouter.get('/yo', requireAuth, async (req, res) => {
  const usuario = await authService.perfil(req.usuario.id);
  res.json({ usuario });
});
