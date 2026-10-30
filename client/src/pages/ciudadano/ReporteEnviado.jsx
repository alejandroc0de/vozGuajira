import { Link, Navigate, useLocation } from 'react-router';
import { Check } from 'lucide-react';
import { haceCuanto } from '../../lib/formato.js';
import { CategoriaIcono, EstadoBadge, PantallaMovil } from '../../components/ui.jsx';

// Paso 3: confirmación. El reporte llega por "state" desde NuevoReporte.
export default function ReporteEnviado() {
  const { state } = useLocation();
  const reporte = state?.reporte;
  if (!reporte) return <Navigate to="/" replace />; // si se entra directo a la URL

  return (
    <PantallaMovil className="confirmacion">
      <div className="confirmacion-icono">
        <span>
          <Check size={44} strokeWidth={3} />
        </span>
      </div>
      <h1 className="titulo-grande centrado">Reporte enviado</h1>
      <p className="texto-2 centrado">
        Las autoridades ya pueden verlo. Puedes seguir su estado en “Mis reportes”.
      </p>

      <div className="card reporte-card">
        <CategoriaIcono slug={reporte.categoria} color={reporte.categoria_color} />
        <div className="reporte-card-texto">
          <strong>{reporte.titulo}</strong>
          <span className="texto-2">
            {reporte.municipio} · {haceCuanto(reporte.creado_en)}
          </span>
          <EstadoBadge estado={reporte.estado} />
        </div>
      </div>

      <div className="acciones">
        <Link to="/mis-reportes" replace className="btn btn-primario">
          Ver mis reportes
        </Link>
        <Link to="/reportar" replace className="btn btn-borde">
          Crear otro reporte
        </Link>
      </div>
    </PantallaMovil>
  );
}
