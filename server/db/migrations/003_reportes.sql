-- Reportes ciudadanos.
CREATE TABLE reportes (
  id             INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  -- El autor se guarda siempre, aunque el reporte sea anónimo:
  -- "anonimo" solo controla si la API pública muestra el nombre.
  usuario_id     INTEGER NOT NULL REFERENCES usuarios(id),
  categoria_id   INTEGER NOT NULL REFERENCES categorias(id),
  titulo         TEXT NOT NULL,
  descripcion    TEXT NOT NULL,
  latitud        NUMERIC(9,6) NOT NULL,   -- 6 decimales ≈ 11 cm de precisión
  longitud       NUMERIC(9,6) NOT NULL,
  municipio      TEXT NOT NULL,
  anonimo        BOOLEAN NOT NULL DEFAULT false,
  estado         TEXT NOT NULL DEFAULT 'recibido'
                 CHECK (estado IN ('recibido', 'en_proceso', 'resuelto')),
  creado_en      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para los filtros más usados (mapa, panel y "Mis reportes").
CREATE INDEX reportes_usuario_idx   ON reportes (usuario_id);
CREATE INDEX reportes_categoria_idx ON reportes (categoria_id);
CREATE INDEX reportes_estado_idx    ON reportes (estado);
