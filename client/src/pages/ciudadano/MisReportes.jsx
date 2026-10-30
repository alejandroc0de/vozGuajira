import { useState } from 'react';
import { Link } from 'react-router';
import { useApi } from '../../lib/useApi.js';
import { ESTADOS } from '../../lib/constantes.js';
import { Cargando, MensajeError, PantallaMovil, ReporteCard } from '../../components/ui.jsx';

export default function MisReportes() {
  const [estado, setEstado] = useState('');
  const { data, cargando, error } = useApi(
    estado ? `/reportes/mios?estado=${estado}` : '/reportes/mios'
  );

  return (
    <PantallaMovil conBarra>
      <div className="contenido">
        <h1 className="titulo-grande">Mis reportes</h1>
        <div className="chips chips-envolver">
          <button
            type="button"
            className={`chip ${estado === '' ? 'activo' : ''}`}
            onClick={() => setEstado('')}
          >
            Todos
          </button>
          {ESTADOS.map((e) => (
            <button
              key={e.valor}
              type="button"
              className={`chip ${estado === e.valor ? 'activo' : ''}`}
              onClick={() => setEstado(e.valor)}
            >
              {e.etiqueta}
            </button>
          ))}
        </div>

        <MensajeError error={error} />
        {cargando && !data ? (
          <Cargando />
        ) : data?.reportes.length === 0 ? (
          <div className="estado-vacio">
            <span>{estado ? 'No tienes reportes en este estado.' : 'Todavía no has hecho reportes.'}</span>
            <Link to="/reportar" className="btn btn-primario">
              Hacer mi primer reporte
            </Link>
          </div>
        ) : (
          <div className="lista">
            {data?.reportes.map((r) => (
              <ReporteCard key={r.id} reporte={r} />
            ))}
          </div>
        )}
      </div>
    </PantallaMovil>
  );
}
