// Formatos de fecha en español usando la API Intl del navegador (sin librerías).

const relativo = new Intl.RelativeTimeFormat('es', { numeric: 'auto' });
const corta = new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'short' });
const conHora = new Intl.DateTimeFormat('es-CO', {
  day: 'numeric',
  month: 'short',
  hour: 'numeric',
  minute: '2-digit',
});

// "hace 2 días", "hace 3 horas", "ahora"
export function haceCuanto(fecha) {
  const segundos = (new Date(fecha) - Date.now()) / 1000;
  const unidades = [
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
  ];
  for (const [unidad, s] of unidades) {
    if (Math.abs(segundos) >= s) return relativo.format(Math.round(segundos / s), unidad);
  }
  return 'ahora';
}

export const fechaCorta = (fecha) => corta.format(new Date(fecha));
export const fechaConHora = (fecha) => conHora.format(new Date(fecha));
