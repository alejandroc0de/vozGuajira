-- Fotos de evidencia. En el MVP queda vacía: la app deja elegir la foto
-- pero todavía no la sube. Cuando se active la subida, solo hace falta
-- un endpoint nuevo; esta tabla ya está lista.
CREATE TABLE evidencias (
  id         INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  reporte_id INTEGER NOT NULL REFERENCES reportes(id) ON DELETE CASCADE,
  url        TEXT NOT NULL,
  creado_en  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
