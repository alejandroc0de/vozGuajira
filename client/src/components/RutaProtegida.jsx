import { Navigate, useLocation } from 'react-router';
import { useAuth } from '../lib/AuthContext.jsx';
import { Cargando } from './ui.jsx';

// Envuelve una página que necesita sesión (y opcionalmente un rol).
// Sin sesión → al login. Con sesión pero sin el rol → al inicio.
// OJO: esto solo es comodidad visual. La seguridad real está en la API,
// que revisa el token y el rol en cada petición.
export function RutaProtegida({ roles, children }) {
  const { usuario, cargando } = useAuth();
  const location = useLocation();

  if (cargando) return <Cargando texto="Verificando sesión…" />;
  if (!usuario) return <Navigate to="/login" replace state={{ desde: location.pathname }} />;
  if (roles && !roles.includes(usuario.rol)) return <Navigate to="/" replace />;
  return children;
}
