// Lee y valida las variables de entorno en un solo lugar.
// Si falta alguna obligatoria, la app no arranca y te dice cuál falta,
// en vez de fallar más tarde con un error confuso.

function requerida(nombre) {
  const valor = process.env[nombre];
  if (!valor) {
    throw new Error(
      `Falta la variable de entorno ${nombre}. Revisa tu archivo .env (usa .env.example como guía).`
    );
  }
  return valor;
}

export const config = {
  port: Number(process.env.PORT) || 3000,
  databaseUrl: requerida('DATABASE_URL'),
  jwtSecret: requerida('JWT_SECRET'),
  jwtExpiresIn: '7d',
};
