// Cliente HTTP de la app: TODAS las llamadas a la API pasan por aquí.
// Se encarga de: poner el token, convertir a JSON y convertir errores en excepciones.

const TOKEN_KEY = 'vg_token';

// localStorage puede fallar (modo privado, permisos), por eso el try/catch.
export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token) {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    /* sin almacenamiento: la sesión dura hasta recargar */
  }
}

export function clearToken() {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* nada que hacer */
  }
}

// AuthContext registra aquí qué hacer cuando la API responde 401 (sesión vencida).
let alExpirarSesion = null;
export function onSesionExpirada(fn) {
  alExpirarSesion = fn;
}

export async function api(ruta, { method = 'GET', body } = {}) {
  const headers = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`/api${ruta}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error('No se pudo conectar con el servidor. ¿Está corriendo la API?');
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    if (res.status === 401 && token) alExpirarSesion?.();
    const error = new Error(data.error || `Error ${res.status}`);
    error.status = res.status;
    error.detalles = data.detalles || [];
    throw error;
  }
  return data;
}
