// Los 15 municipios de La Guajira. Se valida contra esta lista al crear un reporte.
export const MUNICIPIOS = [
  'Albania',
  'Barrancas',
  'Dibulla',
  'Distracción',
  'El Molino',
  'Fonseca',
  'Hatonuevo',
  'La Jagua del Pilar',
  'Maicao',
  'Manaure',
  'Riohacha',
  'San Juan del Cesar',
  'Uribia',
  'Urumita',
  'Villanueva',
];

export const ESTADOS = ['recibido', 'en_proceso', 'resuelto'];

// Transiciones permitidas de la máquina de estados del reporte.
// Ej.: un reporte "resuelto" se puede reabrir a "en_proceso".
export const TRANSICIONES = {
  recibido: ['en_proceso', 'resuelto'],
  en_proceso: ['resuelto', 'recibido'],
  resuelto: ['en_proceso'],
};
