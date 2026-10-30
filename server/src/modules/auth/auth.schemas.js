import { z } from 'zod';

// Convierte "" en undefined, para que un campo vacío del formulario
// cuente como "no enviado" y no como un texto vacío.
const opcional = (schema) =>
  z.preprocess((v) => (typeof v === 'string' && v.trim() === '' ? undefined : v), schema.optional());

export const registroSchema = z
  .object({
    nombre: z.string().trim().min(2, 'Escribe tu nombre').max(100),
    email: opcional(z.string().trim().toLowerCase().pipe(z.email('Correo no válido'))),
    telefono: opcional(
      z.string().trim().regex(/^\+?\d{7,15}$/, 'Teléfono no válido (solo números, 7 a 15 dígitos)')
    ),
    password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres').max(72),
  })
  .refine((d) => d.email || d.telefono, {
    message: 'Escribe un correo o un teléfono',
    path: ['email'],
  });

export const loginSchema = z.object({
  // Correo o teléfono: se normaliza igual que en el registro.
  identificador: z.string().trim().toLowerCase().min(1, 'Escribe tu correo o teléfono'),
  password: z.string().min(1, 'Escribe tu contraseña'),
});
