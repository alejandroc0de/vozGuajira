import { Router } from 'express';
import { requireAuth, optionalAuth, requireRol } from '../../middleware/auth.js';
import {
  crearReporteSchema,
  filtrosSchema,
  cambiarEstadoSchema,
  idSchema,
} from './reportes.schemas.js';
import * as service from './reportes.service.js';

export const reportesRouter = Router();

// OJO con el orden: las rutas fijas (/mios, /resumen) van ANTES de /:id.
// Si no, Express interpretaría "mios" como un id.

// GET /api/reportes?categoria=agua&estado=recibido&municipio=Uribia&q=agua
// Pública: alimenta el mapa.
reportesRouter.get('/', optionalAuth, async (req, res) => {
  const filtros = filtrosSchema.parse(req.query);
  const reportes = await service.listar(filtros, req.usuario?.id);
  res.json({ reportes });
});

// GET /api/reportes/mios → "Mis reportes"
reportesRouter.get('/mios', requireAuth, async (req, res) => {
  const filtros = filtrosSchema.parse(req.query);
  const reportes = await service.listarMios(req.usuario.id, filtros);
  res.json({ reportes });
});

// GET /api/reportes/resumen → tarjetas del panel institucional
reportesRouter.get('/resumen', requireAuth, requireRol('autoridad', 'admin'), async (req, res) => {
  res.json({ resumen: await service.resumen() });
});

// GET /api/reportes/:id → detalle + historial
reportesRouter.get('/:id', optionalAuth, async (req, res) => {
  const { id } = idSchema.parse(req.params);
  const reporte = await service.detalle(id, req.usuario?.id);
  res.json({ reporte });
});

// POST /api/reportes → crear (cualquier usuario con sesión)
reportesRouter.post('/', requireAuth, async (req, res) => {
  const datos = crearReporteSchema.parse(req.body);
  const reporte = await service.crear(datos, req.usuario.id);
  res.status(201).json({ reporte });
});

// PATCH /api/reportes/:id/estado → solo autoridad o admin
reportesRouter.patch(
  '/:id/estado',
  requireAuth,
  requireRol('autoridad', 'admin'),
  async (req, res) => {
    const { id } = idSchema.parse(req.params);
    const datos = cambiarEstadoSchema.parse(req.body);
    const reporte = await service.cambiarEstado(id, datos, req.usuario);
    res.json({ reporte });
  }
);
