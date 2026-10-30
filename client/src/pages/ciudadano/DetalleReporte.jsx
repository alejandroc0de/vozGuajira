import { useParams } from 'react-router';
import { Building2, Camera, MapPin, User } from 'lucide-react';
import { useApi } from '../../lib/useApi.js';
import { ESTADOS } from '../../lib/constantes.js';
import { fechaConHora, fechaCorta } from '../../lib/formato.js';
import {
  CategoriaBadge,
  Cargando,
  Encabezado,
  EstadoBadge,
  MensajeError,
  PantallaMovil,
} from '../../components/ui.jsx';

export default function DetalleReporte() {
  const { id } = useParams();
  const { data, cargando, error } = useApi(`/reportes/${id}`);
  const r = data?.reporte;

  return (
    <PantallaMovil>
      <Encabezado titulo="Detalle del reporte" />
      <div className="contenido">
        <MensajeError error={error} />
        {cargando && !r && <Cargando />}
        {r && (
          <>
            <div className="foto-detalle">
              <Camera size={28} />
              <span>Sin fotos adjuntas</span>
            </div>

            <h1 className="titulo-grande">{r.titulo}</h1>
            <div className="fila-badges">
              <EstadoBadge estado={r.estado} />
              <CategoriaBadge nombre={r.categoria_nombre} color={r.categoria_color} />
            </div>

            <ul className="meta">
              <li>
                <MapPin size={16} /> {r.municipio}, La Guajira
              </li>
              <li>
                <User size={16} />
                {r.es_mio
                  ? `Reportado por ti${r.anonimo ? ' (anónimo)' : ''}`
                  : r.autor
                    ? `Reportado por ${r.autor}`
                    : 'Reporte anónimo'}
                {' · '}
                {fechaCorta(r.creado_en)}
              </li>
              {r.estado !== 'recibido' && (
                <li>
                  <Building2 size={16} /> Atendido por {ultimoAutorInstitucional(r.historial)}
                </li>
              )}
            </ul>

            <p className="descripcion">{r.descripcion}</p>

            <h2 className="subtitulo">Seguimiento</h2>
            <LineaDeTiempo estado={r.estado} historial={r.historial} />
          </>
        )}
      </div>
    </PantallaMovil>
  );
}

function ultimoAutorInstitucional(historial) {
  const fila = [...historial].reverse().find((h) => h.autor_rol !== 'ciudadano');
  return fila?.autor ?? 'la autoridad';
}

// Los 3 pasos siempre se muestran. Un paso está "hecho" si el estado actual
// llegó hasta él; la fecha y la nota salen del último cambio a ese estado.
function LineaDeTiempo({ estado, historial }) {
  const indiceActual = ESTADOS.findIndex((e) => e.valor === estado);

  return (
    <ol className="linea-tiempo">
      {ESTADOS.map((paso, i) => {
        const hecho = i <= indiceActual;
        const fila = [...historial].reverse().find((h) => h.estado_nuevo === paso.valor);
        return (
          <li key={paso.valor} className={hecho ? 'hecho' : ''}>
            <span className="punto" />
            <div>
              <strong>{paso.etiqueta}</strong>
              <span className="texto-2 pequeno">
                {hecho && fila ? fechaConHora(fila.creado_en) : 'Pendiente'}
                {hecho && fila?.observacion && fila.estado_anterior ? ` · ${fila.observacion}` : ''}
              </span>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
