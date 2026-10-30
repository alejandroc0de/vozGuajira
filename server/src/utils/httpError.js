// Error con código HTTP. Los services lo lanzan (ej.: 404 si no existe un reporte)
// y el errorHandler lo convierte en respuesta JSON.
export class HttpError extends Error {
  constructor(status, mensaje) {
    super(mensaje);
    this.status = status;
  }
}
