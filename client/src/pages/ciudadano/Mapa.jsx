import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { CircleMarker, MapContainer, TileLayer } from 'react-leaflet';
import { Plus, Search, X } from 'lucide-react';
import { useApi } from '../../lib/useApi.js';
import { CENTRO_GUAJIRA } from '../../lib/constantes.js';
import { haceCuanto } from '../../lib/formato.js';
import { CategoriaIcono, EstadoBadge, PantallaMovil } from '../../components/ui.jsx';

export default function Mapa() {
  const [categoria, setCategoria] = useState(''); // '' = Todos
  const [busqueda, setBusqueda] = useState('');
  const [seleccionado, setSeleccionado] = useState(null);

  // El filtro de categoría se pide a la API; la búsqueda se filtra aquí mismo.
  const { data } = useApi(categoria ? `/reportes?categoria=${categoria}` : '/reportes');
  const { data: dataCat } = useApi('/categorias');

  const reportes = useMemo(() => {
    const lista = data?.reportes ?? [];
    const q = busqueda.trim().toLowerCase();
    if (!q) return lista;
    return lista.filter(
      (r) => r.titulo.toLowerCase().includes(q) || r.municipio.toLowerCase().includes(q)
    );
  }, [data, busqueda]);

  return (
    <PantallaMovil conBarra className="pantalla-mapa">
      {/* react-leaflet: MapContainer crea el mapa, TileLayer pone las imágenes de OpenStreetMap
          y cada CircleMarker es un punto. Se usan círculos (no íconos) para pintarlos por categoría. */}
      <MapContainer center={CENTRO_GUAJIRA} zoom={8} className="mapa-completo" zoomControl={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {reportes.map((r) => (
          <CircleMarker
            key={r.id}
            center={[r.latitud, r.longitud]}
            radius={seleccionado?.id === r.id ? 13 : 10}
            pathOptions={{ color: '#fff', weight: 3, fillColor: r.categoria_color, fillOpacity: 1 }}
            eventHandlers={{ click: () => setSeleccionado(r) }}
          />
        ))}
      </MapContainer>

      <div className="mapa-superior">
        <div className="buscador">
          <Search size={20} className="texto-2" />
          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar municipio o reporte"
          />
          {busqueda && (
            <button type="button" aria-label="Borrar búsqueda" onClick={() => setBusqueda('')}>
              <X size={18} />
            </button>
          )}
        </div>
        <div className="chips">
          <button
            type="button"
            className={`chip ${categoria === '' ? 'activo' : ''}`}
            onClick={() => setCategoria('')}
          >
            Todos
          </button>
          {dataCat?.categorias.map((c) => (
            <button
              key={c.slug}
              type="button"
              className={`chip ${categoria === c.slug ? 'activo' : ''}`}
              onClick={() => {
                setCategoria(c.slug);
                setSeleccionado(null);
              }}
            >
              <span className="badge-punto" style={{ background: c.color }} />
              {c.nombre}
            </button>
          ))}
        </div>
      </div>

      <div className="mapa-inferior">
        <Link to="/reportar" className="btn-reportar">
          <Plus size={22} strokeWidth={2.5} /> Reportar
        </Link>

        {seleccionado && (
          <div className="card tarjeta-flotante">
            <button
              type="button"
              className="cerrar"
              aria-label="Cerrar"
              onClick={() => setSeleccionado(null)}
            >
              <X size={18} />
            </button>
            <Link to={`/reportes/${seleccionado.id}`} className="tarjeta-flotante-cuerpo">
              <CategoriaIcono slug={seleccionado.categoria} color={seleccionado.categoria_color} tamano={52} />
              <div>
                <strong className="titulo-tarjeta">{seleccionado.titulo}</strong>
                <span className="texto-2">
                  {seleccionado.municipio} · {haceCuanto(seleccionado.creado_en)}
                </span>
              </div>
            </Link>
            <div className="fila-entre">
              <EstadoBadge estado={seleccionado.estado} />
              <Link to={`/reportes/${seleccionado.id}`} className="enlace">
                Ver detalle
              </Link>
            </div>
          </div>
        )}
      </div>
    </PantallaMovil>
  );
}
