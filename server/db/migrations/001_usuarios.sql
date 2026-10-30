-- Usuarios del sistema: ciudadanos, autoridades y administradores.
CREATE TABLE usuarios (
  id            INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nombre        TEXT NOT NULL,
  email         TEXT UNIQUE,
  telefono      TEXT UNIQUE,
  password_hash TEXT NOT NULL,          -- nunca la contraseña, solo el hash de bcrypt
  rol           TEXT NOT NULL DEFAULT 'ciudadano'
                CHECK (rol IN ('ciudadano', 'autoridad', 'admin')),
  creado_en     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- El login es "correo o teléfono": al menos uno de los dos es obligatorio.
  CHECK (email IS NOT NULL OR telefono IS NOT NULL)
);
