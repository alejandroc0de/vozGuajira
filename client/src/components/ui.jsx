// Componentes visuales pequeños y reutilizables.
import { Link, NavLink, useNavigate } from 'react-router';
import {
  Apple,
  ChevronLeft,
  ChevronRight,
  Construction,
  Droplet,
  Flame,
  List,
  Loader2,
  MapPin,
  Plus,
  User,
  Zap,
} from 'lucide-react';
import { ETIQUETA_ESTADO } from '../lib/constantes.js';
import { haceCuanto } from '../lib/formato.js';

// Icono por categoría (el slug viene de la base de datos).
const ICONOS = {
  agua: Droplet,
  energia: Zap,
  salud: Plus,
  alimentacion: Apple,
  infraestructura: Construction,
  incendio: Flame,
};

// Círculo pastel con el icono de la categoría, como en el mockup.
// color + "22" = el mismo color con ~13% de opacidad (hex con canal alfa).
export function CategoriaIcono({ slug, color, tamano = 44 }) {
  const Icono = ICONOS[slug] ?? MapPin;
  return (
    <span
      className="cat-icono"
      style={{ width: tamano, height: tamano, background: `${color}22`, color }}
    >
      <Icono size={tamano * 0.48} strokeWidth={2} />
    </span>
  );
}

export function EstadoBadge({ estado }) {
  return <span className={`badge badge-${estado}`}>{ETIQUETA_ESTADO[estado] ?? estado}</span>;
}

export function CategoriaBadge({ nombre, color }) {
  return (
    <span className="badge" style={{ background: `${color}1f`, color: '#3a3a3a' }}>
      <span className="badge-punto" style={{ background: color }} />
      {nombre}
    </span>
  );
}

// Tarjeta de reporte usada en "Mis reportes".
export function ReporteCard({ reporte }) {
  return (
    <Link to={`/reportes/${reporte.id}`} className="card reporte-card">
      <CategoriaIcono slug={reporte.categoria} color={reporte.categoria_color} />
      <div className="reporte-card-texto">
        <strong>{reporte.titulo}</strong>
        <span className="texto-2">
          {reporte.municipio} · {haceCuanto(reporte.creado_en)}
        </span>
        <EstadoBadge estado={reporte.estado} />
      </div>
      <ChevronRight className="texto-2" size={20} />
    </Link>
  );
}

// Encabezado con botón "atrás" de las pantallas internas.
export function Encabezado({ titulo, alVolver }) {
  const navigate = useNavigate();
  return (
    <header className="encabezado">
      <button
        type="button"
        className="btn-circulo"
        aria-label="Volver"
        onClick={alVolver ?? (() => navigate(-1))}
      >
        <ChevronLeft size={22} />
      </button>
      <h1>{titulo}</h1>
    </header>
  );
}

export function BarraInferior() {
  const items = [
    { to: '/', icono: MapPin, texto: 'Mapa', end: true },
    { to: '/mis-reportes', icono: List, texto: 'Mis reportes' },
    { to: '/perfil', icono: User, texto: 'Perfil' },
  ];
  return (
    <nav className="barra-inferior">
      {items.map(({ to, icono: Icono, texto, end }) => (
        <NavLink key={to} to={to} end={end} className="barra-item">
          <Icono size={24} />
          <span>{texto}</span>
        </NavLink>
      ))}
    </nav>
  );
}

// Contenedor de la app ciudadana: columna tipo celular centrada en pantallas grandes.
export function PantallaMovil({ children, conBarra = false, className = '' }) {
  return (
    <div className="movil-fondo">
      <div className={`movil ${conBarra ? 'con-barra' : ''} ${className}`}>
        {children}
        {conBarra && <BarraInferior />}
      </div>
    </div>
  );
}

export function Cargando({ texto = 'Cargando…' }) {
  return (
    <div className="estado-vacio">
      <Loader2 className="girando" size={28} />
      <span>{texto}</span>
    </div>
  );
}

export function MensajeError({ error }) {
  if (!error) return null;
  return (
    <div className="alerta-error" role="alert">
      <strong>{error.message}</strong>
      {error.detalles?.length > 0 && (
        <ul>
          {error.detalles.map((d, i) => (
            <li key={i}>{d.mensaje}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
