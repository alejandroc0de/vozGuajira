import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api, clearToken, getToken, onSesionExpirada, setToken } from './api.js';

// Contexto de autenticación: cualquier componente puede saber quién está
// conectado con useAuth(), sin pasar props de componente en componente.
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  // true mientras se revisa si el token guardado sigue siendo válido.
  const [cargando, setCargando] = useState(Boolean(getToken()));

  const logout = useCallback(() => {
    clearToken();
    setUsuario(null);
  }, []);

  // Al abrir la app: si hay token guardado, se pregunta a la API quién es.
  useEffect(() => {
    onSesionExpirada(logout);
    if (!getToken()) return;
    api('/auth/yo')
      .then((data) => setUsuario(data.usuario))
      .catch(() => logout())
      .finally(() => setCargando(false));
  }, [logout]);

  async function login(identificador, password) {
    const data = await api('/auth/login', { method: 'POST', body: { identificador, password } });
    setToken(data.token);
    setUsuario(data.usuario);
    return data.usuario;
  }

  async function registro(datos) {
    const data = await api('/auth/registro', { method: 'POST', body: datos });
    setToken(data.token);
    setUsuario(data.usuario);
    return data.usuario;
  }

  return (
    <AuthContext.Provider value={{ usuario, cargando, login, registro, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}

export function esInstitucional(usuario) {
  return usuario?.rol === 'autoridad' || usuario?.rol === 'admin';
}
