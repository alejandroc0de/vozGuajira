// Datos de prueba: 2 usuarios y algunos reportes en La Guajira.
// Uso: npm run seed   (después de npm run migrate)
//
// Usuarios que crea (contraseña de ambos: demo1234):
//   ciudadano  →  ciudadano@vozguajira.co
//   autoridad  →  autoridad@vozguajira.co   (entra al panel institucional)

import bcrypt from 'bcryptjs';
import { pool, enTransaccion } from '../src/db/pool.js';

const REPORTES = [
  // [categoria, titulo, descripcion, lat, lng, municipio, anonimo, estadoFinal, diasAtras]
  ['agua', 'Falta de agua potable', 'Hace 5 días no llega agua a nuestro barrio. Varias familias con niños pequeños están afectadas.', 11.7139, -72.2659, 'Uribia', true, 'en_proceso', 2],
  ['energia', 'Corte de energía eléctrica', 'Llevamos tres días sin luz en todo el sector. Se dañan los alimentos.', 11.7750, -72.4447, 'Manaure', false, 'en_proceso', 9],
  ['infraestructura', 'Vía en mal estado', 'La vía principal tiene huecos grandes; los carros y motos se accidentan.', 11.5444, -72.9072, 'Riohacha', false, 'resuelto', 18],
  ['alimentacion', 'Falta de alimentos en comunidad', 'La comunidad no ha recibido el programa de alimentación escolar este mes.', 11.3779, -72.2390, 'Maicao', false, 'recibido', 21],
  ['salud', 'Puesto de salud sin médico', 'El puesto de salud lleva dos semanas cerrado, sin personal.', 11.1608, -72.5920, 'Albania', true, 'recibido', 4],
  ['agua', 'Jagüey contaminado', 'El agua del jagüey tiene mal olor y color; los niños se están enfermando.', 11.6200, -72.1500, 'Uribia', false, 'recibido', 1],
  ['incendio', 'Incendio forestal cerca de viviendas', 'Hay un incendio de maleza a pocos metros de las casas.', 11.2725, -73.3092, 'Dibulla', false, 'resuelto', 12],
  ['energia', 'Poste a punto de caer', 'Un poste de luz quedó inclinado después del viento fuerte.', 10.8853, -72.8484, 'Fonseca', false, 'recibido', 3],
];

const SIGUIENTE = { recibido: [], en_proceso: ['en_proceso'], resuelto: ['en_proceso', 'resuelto'] };

async function main() {
  const { rowCount } = await pool.query(
    `SELECT 1 FROM usuarios WHERE email = 'ciudadano@vozguajira.co'`
  );
  if (rowCount > 0) {
    console.log('Los datos de prueba ya existen. Nada que hacer.');
    return;
  }

  const hash = await bcrypt.hash('demo1234', 10);

  await enTransaccion(async (db) => {
    const insertarUsuario = async (nombre, email, rol) =>
      (
        await db.query(
          `INSERT INTO usuarios (nombre, email, password_hash, rol) VALUES ($1, $2, $3, $4) RETURNING id`,
          [nombre, email, hash, rol]
        )
      ).rows[0].id;

    const ciudadanoId = await insertarUsuario('María Pushaina', 'ciudadano@vozguajira.co', 'ciudadano');
    const autoridadId = await insertarUsuario('Secretaría de Servicios Públicos', 'autoridad@vozguajira.co', 'autoridad');

    for (const [categoria, titulo, descripcion, lat, lng, municipio, anonimo, estadoFinal, dias] of REPORTES) {
      const creado = `NOW() - INTERVAL '${dias} days'`;
      const { rows } = await db.query(
        `INSERT INTO reportes (usuario_id, categoria_id, titulo, descripcion, latitud, longitud,
                               municipio, anonimo, estado, creado_en, actualizado_en)
         VALUES ($1, (SELECT id FROM categorias WHERE slug = $2), $3, $4, $5, $6, $7, $8, $9, ${creado}, ${creado})
         RETURNING id`,
        [ciudadanoId, categoria, titulo, descripcion, lat, lng, municipio, anonimo, estadoFinal]
      );
      const reporteId = rows[0].id;

      // Historial coherente con el estado final.
      await db.query(
        `INSERT INTO historial_estados (reporte_id, usuario_id, estado_anterior, estado_nuevo, observacion, creado_en)
         VALUES ($1, $2, NULL, 'recibido', 'Reporte creado', ${creado})`,
        [reporteId, ciudadanoId]
      );
      let anterior = 'recibido';
      let diaCambio = dias;
      for (const nuevo of SIGUIENTE[estadoFinal]) {
        diaCambio = Math.max(diaCambio - 1, 0);
        const observacion =
          nuevo === 'en_proceso' ? 'Asignado a Servicios Públicos' : 'Se atendió el problema en terreno';
        await db.query(
          `INSERT INTO historial_estados (reporte_id, usuario_id, estado_anterior, estado_nuevo, observacion, creado_en)
           VALUES ($1, $2, $3, $4, $5, NOW() - INTERVAL '${diaCambio} days')`,
          [reporteId, autoridadId, anterior, nuevo, observacion]
        );
        anterior = nuevo;
      }
    }
  });

  console.log('✔ Datos de prueba creados.');
  console.log('  ciudadano@vozguajira.co / demo1234');
  console.log('  autoridad@vozguajira.co / demo1234');
}

main()
  .catch((err) => {
    console.error('✖', err.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
