-- Máquina de estados: cada cambio de estado de un reporte queda registrado.
-- De aquí sale la línea de tiempo "Seguimiento" del detalle.
CREATE TABLE historial_estados (
  id              INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  reporte_id      INTEGER NOT NULL REFERENCES reportes(id) ON DELETE CASCADE,
  usuario_id      INTEGER NOT NULL REFERENCES usuarios(id),  -- quién hizo el cambio
  estado_anterior TEXT,                                      -- NULL en la creación
  estado_nuevo    TEXT NOT NULL,
  observacion     TEXT,
  creado_en       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX historial_reporte_idx ON historial_estados (reporte_id);
