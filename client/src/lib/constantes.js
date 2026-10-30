// Nombre visible de la app: cámbialo aquí y cambia en toda la interfaz.
export const APP_NOMBRE = 'Voz Guajira';

// Centro aproximado de La Guajira para el mapa.
export const CENTRO_GUAJIRA = [11.3, -72.6];

// Municipios con su cabecera aproximada (para sugerir el más cercano al GPS).
export const MUNICIPIOS = [
  { nombre: 'Albania', lat: 11.1608, lng: -72.592 },
  { nombre: 'Barrancas', lat: 10.9575, lng: -72.7867 },
  { nombre: 'Dibulla', lat: 11.2725, lng: -73.3092 },
  { nombre: 'Distracción', lat: 10.8975, lng: -72.8869 },
  { nombre: 'El Molino', lat: 10.6531, lng: -72.9247 },
  { nombre: 'Fonseca', lat: 10.8853, lng: -72.8484 },
  { nombre: 'Hatonuevo', lat: 11.0694, lng: -72.7667 },
  { nombre: 'La Jagua del Pilar', lat: 10.5108, lng: -73.0717 },
  { nombre: 'Maicao', lat: 11.3779, lng: -72.239 },
  { nombre: 'Manaure', lat: 11.775, lng: -72.4447 },
  { nombre: 'Riohacha', lat: 11.5444, lng: -72.9072 },
  { nombre: 'San Juan del Cesar', lat: 10.7711, lng: -73.0031 },
  { nombre: 'Uribia', lat: 11.7139, lng: -72.2659 },
  { nombre: 'Urumita', lat: 10.5597, lng: -73.0136 },
  { nombre: 'Villanueva', lat: 10.605, lng: -72.98 },
];

// Distancia aproximada en grados: suficiente para elegir el municipio más cercano.
export function municipioMasCercano(lat, lng) {
  let mejor = MUNICIPIOS[0];
  let menor = Infinity;
  for (const m of MUNICIPIOS) {
    const d = (m.lat - lat) ** 2 + (m.lng - lng) ** 2;
    if (d < menor) {
      menor = d;
      mejor = m;
    }
  }
  return mejor.nombre;
}

export const ESTADOS = [
  { valor: 'recibido', etiqueta: 'Recibido' },
  { valor: 'en_proceso', etiqueta: 'En proceso' },
  { valor: 'resuelto', etiqueta: 'Resuelto' },
];

export const ETIQUETA_ESTADO = Object.fromEntries(ESTADOS.map((e) => [e.valor, e.etiqueta]));

// Debe coincidir con TRANSICIONES del backend (server/src/constants/municipios.js).
export const TRANSICIONES = {
  recibido: ['en_proceso', 'resuelto'],
  en_proceso: ['resuelto', 'recibido'],
  resuelto: ['en_proceso'],
};
