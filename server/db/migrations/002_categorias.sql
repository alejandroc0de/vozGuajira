-- Categorías configurables (RF15). Es una tabla, no un CHECK, para poder
-- agregar categorías sin cambiar el código.
CREATE TABLE categorias (
  id     INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  slug   TEXT NOT NULL UNIQUE,   -- identificador sin tildes; React elige el icono con él
  nombre TEXT NOT NULL,
  color  TEXT NOT NULL
);

-- Datos de referencia: la app no funciona sin ellos, por eso van en la migración.
INSERT INTO categorias (slug, nombre, color) VALUES
  ('agua',            'Agua',            '#3B73C4'),
  ('energia',         'Energía',         '#D9A520'),
  ('salud',           'Salud',           '#D9534F'),
  ('alimentacion',    'Alimentación',    '#4E9A5C'),
  ('infraestructura', 'Infraestructura', '#8A8F98'),
  ('incendio',        'Incendio',        '#E07B39');
