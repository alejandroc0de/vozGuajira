import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { BarChart3, Download, LayoutList, LogOut, Map as MapIcon, MessageCircle, Users, X } from 'lucide-react';
import { api } from '../../lib/api.js';
import { useAuth } from '../../lib/AuthContext.jsx';
import { useApi } from '../../lib/useApi.js';
import {
  APP_NOMBRE,
  ESTADOS,
  ETIQUETA_ESTADO,
  MUNICIPIOS,
  TRANSICIONES,
} from '../../lib/constantes.js';
import { fechaConHora, fechaCorta } from '../../lib/formato.js';
import { CategoriaIcono, EstadoBadge, MensajeError } from '../../components/ui.jsx';

// Arma "?categoria=agua&estado=recibido" solo con los filtros que tienen valor.
function aQueryString(filtros) {
  const params = new URLSearchParams(Object.entries(filtros).filter(([, v]) => v));
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

export default function Panel() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const [filtros, setFiltros] = useState({ municipio: '', categoria: '', estado: '' });
  const [abierto, setAbierto] = useState(null); // id del reporte en el modal

  const lista = useApi(`/reportes${aQueryString(filtros)}`);
  const resumen = useApi('/reportes/resumen');
  const { data: dataCat } = useApi('/categorias');

  const cambiarFiltro = (campo) => (e) => setFiltros((f) => ({ ...f, [campo]: e.target.value }));

  function alGuardar() {
    lista.recargar();
    resumen.recargar();
  }

  const r = resumen.data?.resumen;
  const tarjetas = [
    { titulo: 'Reportes totales', valor: r?.total },
    { titulo: 'Recibidos', valor: r?.recibidos, clase: 'kpi-recibido' },
    { titulo: 'En proceso', valor: r?.en_proceso, clase: 'kpi-proceso' },
    { titulo: 'Resueltos', valor: r?.resueltos, clase: 'kpi-resuelto' },
  ];

  return (
    <div className="panel">
      <aside className="panel-lateral">
        <div className="panel-marca">
          <span className="panel-logo">
            <MessageCircle size={20} />
          </span>
          <div>
            <strong>{APP_NOMBRE}</strong>
            <span>Panel institucional</span>
          </div>
        </div>
        <nav>
          <span className="panel-nav activo">
            <LayoutList size={18} /> Reportes
          </span>
          {[
            [MapIcon, 'Mapa de calor'],
            [BarChart3, 'Estadísticas'],
            [Download, 'Exportar'],
            [Users, 'Administración'],
          ].map(([Icono, texto]) => (
            <span key={texto} className="panel-nav deshabilitado" title="Próximamente">
              <Icono size={18} /> {texto}
            </span>
          ))}
        </nav>
        <div className="panel-lateral-pie">
          <Link to="/" className="panel-nav">
            <MapIcon size={18} /> Ver app ciudadana
          </Link>
          <button
            type="button"
            className="panel-nav"
            onClick={() => {
              logout();
              navigate('/login', { replace: true });
            }}
          >
            <LogOut size={18} /> Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="panel-principal">
        <header className="panel-encabezado">
          <div>
            <h1>Reportes ciudadanos</h1>
            <span className="texto-2">{usuario.nombre} · La Guajira</span>
          </div>
          <div className="panel-filtros">
            <select value={filtros.municipio} onChange={cambiarFiltro('municipio')} aria-label="Municipio">
              <option value="">Municipio: Todos</option>
              {MUNICIPIOS.map((m) => (
                <option key={m.nombre} value={m.nombre}>
                  {m.nombre}
                </option>
              ))}
            </select>
            <select value={filtros.categoria} onChange={cambiarFiltro('categoria')} aria-label="Categoría">
              <option value="">Categoría: Todas</option>
              {dataCat?.categorias.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.nombre}
                </option>
              ))}
            </select>
            <select value={filtros.estado} onChange={cambiarFiltro('estado')} aria-label="Estado">
              <option value="">Estado: Todos</option>
              {ESTADOS.map((e) => (
                <option key={e.valor} value={e.valor}>
                  {e.etiqueta}
                </option>
              ))}
            </select>
          </div>
        </header>

        <section className="kpis">
          {tarjetas.map((t) => (
            <div key={t.titulo} className={`card kpi ${t.clase ?? ''}`}>
              <span className="texto-2">{t.titulo}</span>
              <strong>{t.valor ?? '–'}</strong>
            </div>
          ))}
        </section>

        <section className="card tabla-contenedor">
          <h2>Reportes {filtros.municipio || filtros.categoria || filtros.estado ? 'filtrados' : 'recientes'}</h2>
          <MensajeError error={lista.error} />
          <div className="tabla-scroll">
            <table className="tabla">
              <thead>
                <tr>
                  <th>Categoría</th>
                  <th>Reporte</th>
                  <th>Municipio</th>
                  <th>Fecha</th>
                  <th>Estado</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {lista.data?.reportes.map((rep) => (
                  <tr key={rep.id}>
                    <td>
                      <span className="celda-categoria">
                        <CategoriaIcono slug={rep.categoria} color={rep.categoria_color} tamano={28} />
                        {rep.categoria_nombre}
                      </span>
                    </td>
                    <td className="celda-titulo">{rep.titulo}</td>
                    <td>{rep.municipio}</td>
                    <td className="texto-2">{fechaCorta(rep.creado_en)}</td>
                    <td>
                      <EstadoBadge estado={rep.estado} />
                    </td>
                    <td>
                      <button type="button" className="enlace" onClick={() => setAbierto(rep.id)}>
                        {rep.estado === 'resuelto' ? 'Ver' : 'Gestionar'}
                      </button>
                    </td>
                  </tr>
                ))}
                {lista.data?.reportes.length === 0 && (
                  <tr>
                    <td colSpan={6} className="texto-2 centrado">
                      No hay reportes con estos filtros.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {abierto && (
        <ModalReporte id={abierto} alCerrar={() => setAbierto(null)} alGuardar={alGuardar} />
      )}
    </div>
  );
}

// Modal con el detalle del reporte y el formulario para cambiar su estado.
function ModalReporte({ id, alCerrar, alGuardar }) {
  const { data, error, recargar } = useApi(`/reportes/${id}`);
  const r = data?.reporte;
  const [nuevoEstado, setNuevoEstado] = useState('');
  const [observacion, setObservacion] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [errorGuardar, setErrorGuardar] = useState(null);

  // Cerrar con la tecla Escape.
  useEffect(() => {
    const alTeclear = (e) => e.key === 'Escape' && alCerrar();
    window.addEventListener('keydown', alTeclear);
    return () => window.removeEventListener('keydown', alTeclear);
  }, [alCerrar]);

  // Cuando carga el reporte, preselecciona la primera transición permitida.
  useEffect(() => {
    if (r) setNuevoEstado(TRANSICIONES[r.estado][0]);
  }, [r]);

  async function guardar(e) {
    e.preventDefault();
    setGuardando(true);
    setErrorGuardar(null);
    try {
      await api(`/reportes/${id}/estado`, {
        method: 'PATCH',
        body: { estado: nuevoEstado, observacion: observacion || undefined },
      });
      setObservacion('');
      recargar();
      alGuardar();
    } catch (err) {
      setErrorGuardar(err);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="modal-fondo" onClick={alCerrar}>
      {/* stopPropagation: un clic DENTRO del modal no debe cerrarlo */}
      <div className="modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="cerrar" aria-label="Cerrar" onClick={alCerrar}>
          <X size={20} />
        </button>
        <MensajeError error={error} />
        {r && (
          <>
            <div className="modal-cabecera">
              <CategoriaIcono slug={r.categoria} color={r.categoria_color} />
              <div>
                <h2>{r.titulo}</h2>
                <span className="texto-2">
                  {r.municipio} · {fechaConHora(r.creado_en)} · {r.autor ?? 'Anónimo'}
                </span>
              </div>
            </div>
            <p className="descripcion">{r.descripcion}</p>

            <h3 className="subtitulo">Historial</h3>
            <ul className="historial">
              {r.historial.map((h) => (
                <li key={h.id}>
                  <EstadoBadge estado={h.estado_nuevo} />
                  <div>
                    <span>{h.observacion || '—'}</span>
                    <span className="texto-2 pequeno">
                      {fechaConHora(h.creado_en)} · {h.autor ?? 'Ciudadano (anónimo)'}
                    </span>
                  </div>
                </li>
              ))}
            </ul>

            <form onSubmit={guardar} className="formulario modal-form">
              <h3 className="subtitulo">Cambiar estado</h3>
              <label className="campo">
                <span>
                  Estado actual: <strong>{ETIQUETA_ESTADO[r.estado]}</strong> → nuevo estado
                </span>
                <select value={nuevoEstado} onChange={(e) => setNuevoEstado(e.target.value)}>
                  {TRANSICIONES[r.estado].map((e) => (
                    <option key={e} value={e}>
                      {ETIQUETA_ESTADO[e]}
                    </option>
                  ))}
                </select>
              </label>
              <label className="campo">
                <span>Observación (la verá el ciudadano)</span>
                <textarea
                  rows={2}
                  value={observacion}
                  onChange={(e) => setObservacion(e.target.value)}
                  placeholder="Ej.: Cuadrilla enviada al sector"
                  maxLength={500}
                />
              </label>
              <MensajeError error={errorGuardar} />
              <button type="submit" className="btn btn-primario" disabled={guardando}>
                {guardando ? 'Guardando…' : 'Guardar cambio'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
