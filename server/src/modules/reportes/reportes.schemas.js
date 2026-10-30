import { z } from 'zod';
import { MUNICIPIOS, ESTADOS } from '../../constants/municipios.js';

export const crearReporteSchema = z.object({
  categoria: z.string().trim().min(1, 'Elige una categoría'),
  titulo: z.string().trim().min(4, 'El título es muy corto').max(80, 'Máximo 80 caracteres'),
  descripcion: z
    .string()
    .trim()
    .min(10, 'Describe el problema con al menos 10 caracteres')
    .max(1000, 'Máximo 1000 caracteres'),
  latitud: z.number().min(-90).max(90),
  longitud: z.number().min(-180).max(180),
  municipio: z.enum(MUNICIPIOS, { error: 'Elige un municipio de La Guajira' }),
  anonimo: z.boolean().default(false),
});

// Los filtros llegan por la URL (?categoria=agua&estado=recibido), siempre como texto.
export const filtrosSchema = z.object({
  categoria: z.string().trim().optional(),
  estado: z.enum(ESTADOS, { error: 'Estado no válido' }).optional(),
  municipio: z.enum(MUNICIPIOS, { error: 'Municipio no válido' }).optional(),
  q: z.string().trim().max(100).optional(),
});

export const cambiarEstadoSchema = z.object({
  estado: z.enum(ESTADOS, { error: 'Estado no válido' }),
  observacion: z.string().trim().max(500).optional(),
});

// z.coerce convierte el texto "12" de la URL en el número 12.
export const idSchema = z.object({ id: z.coerce.number().int().positive() });
