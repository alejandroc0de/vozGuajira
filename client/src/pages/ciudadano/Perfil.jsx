import { Link, useNavigate } from 'react-router';
import { LayoutList, LogOut } from 'lucide-react';
import { esInstitucional, useAuth } from '../../lib/AuthContext.jsx';
import { PantallaMovil } from '../../components/ui.jsx';

const ROLES = { ciudadano: 'Ciudadano', autoridad: 'Autoridad', admin: 'Administrador' };

export default function Perfil() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  // Iniciales para el avatar: "María Pushaina" → "MP"
  const iniciales = usuario.nombre
    .split(' ')
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase();

  return (
    <PantallaMovil conBarra>
      <div className="contenido">
        <h1 className="titulo-grande">Perfil</h1>
        <div className="card perfil">
          <span className="avatar">{iniciales}</span>
          <div>
            <strong>{usuario.nombre}</strong>
            <span className="texto-2">{usuario.email ?? usuario.telefono}</span>
            <span className="badge badge-rol">{ROLES[usuario.rol]}</span>
          </div>
        </div>

        <div className="acciones">
          {esInstitucional(usuario) && (
            <Link to="/panel" className="btn btn-primario">
              <LayoutList size={18} /> Ir al panel institucional
            </Link>
          )}
          <button
            type="button"
            className="btn btn-borde"
            onClick={() => {
              logout();
              navigate('/login', { replace: true });
            }}
          >
            <LogOut size={18} /> Cerrar sesión
          </button>
        </div>
      </div>
    </PantallaMovil>
  );
}
