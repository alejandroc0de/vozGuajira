import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { CircleMarker, MapContainer, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import { Camera, Check, LocateFixed, Plus, Shield, X } from 'lucide-react';
import { api } from '../../lib/api.js';
import { useApi } from '../../lib/useApi.js';
import { CENTRO_GUAJIRA, MUNICIPIOS, municipioMasCercano } from '../../lib/constantes.js';
import { CategoriaIcono, Encabezado, MensajeError, PantallaMovil } from '../../components/ui.jsx';

// Formulario en 2 pasos (el paso 3 es la pantalla de confirmación).
export default function NuevoReporte() {
  const navigate = useNavigate();
  const [paso, setPaso] = useState(1);
  const [categoria, setCategoria] = useState(null);

  return (
    <PantallaMovil className="pantalla-formulario">
      <Encabezado
        titulo="Nuevo reporte"
        alVolver={() => (paso === 2 ? setPaso(1) : navigate(-1))}
      />
      <Progreso paso={paso} />

      {paso === 1 ? (
        <PasoCategoria
          seleccionada={categoria}
          alElegir={setCategoria}
          alContinuar={() => setPaso(2)}
        />
      ) : (
        <PasoDetalles categoria={categoria} />
      )}
    </PantallaMovil>
  );
}

function Progreso({ paso }) {
  const nombres = ['Categoría', 'Detalles', 'Enviado'];
  return (
    <div className="progreso">
      <div className="progreso-barras">
        {[1, 2, 3].map((n) => (
          <span key={n} className={n <= paso ? 'lleno' : ''} />
        ))}
      </div>
      <span className="texto-2 pequeno">
        Paso {paso} de 3 · {nombres[paso - 1]}
      </span>
    </div>
  );
}

// ── Paso 1 ─────────────────────────────────────────────
function PasoCategoria({ seleccionada, alElegir, alContinuar }) {
  const { data } = useApi('/categorias');

  return (
    <>
      <div className="contenido">
        <h2 className="titulo-grande">¿Qué problema quieres reportar?</h2>
        <p className="texto-2">Elige la categoría que mejor lo describe.</p>
        <div className="grilla-categorias">
          {data?.categorias.map((c) => {
            const activa = seleccionada?.slug === c.slug;
            return (
              <button
                key={c.slug}
                type="button"
                className={`card opcion-categoria ${activa ? 'activa' : ''}`}
                onClick={() => alElegir(c)}
                aria-pressed={activa}
              >
                {activa && (
                  <span className="check">
                    <Check size={14} strokeWidth={3} />
                  </span>
                )}
                <CategoriaIcono slug={c.slug} color={c.color} tamano={52} />
                <strong>{c.nombre}</strong>
              </button>
            );
          })}
        </div>
      </div>
      <div className="pie-fijo">
        <button
          type="button"
          className="btn btn-primario"
          disabled={!seleccionada}
          onClick={alContinuar}
        >
          Continuar
        </button>
      </div>
    </>
  );
}

// ── Paso 2 ─────────────────────────────────────────────
function PasoDetalles({ categoria }) {
  const navigate = useNavigate();
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [anonimo, setAnonimo] = useState(false);
  const [fotos, setFotos] = useState([]); // [{ id, url }]
  const [posicion, setPosicion] = useState(null); // [lat, lng]
  const [municipio, setMunicipio] = useState('');
  const [origenUbicacion, setOrigenUbicacion] = useState('buscando'); // buscando | gps | mapa | manual
  const [error, setError] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const inputFotos = useRef(null);

  // Al entrar al paso: pedir la ubicación al GPS del navegador.
  useEffect(() => {
    if (!navigator.geolocation) {
      setOrigenUbicacion('manual');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        actualizarPosicion([coords.latitude, coords.longitude]);
        setOrigenUbicacion('gps');
      },
      () => setOrigenUbicacion('manual'), // el usuario negó el permiso o falló
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  // URL.createObjectURL crea una URL temporal para mostrar la imagen
  // sin subirla. Hay que liberarla (revokeObjectURL) para no gastar memoria.
  // El ref guarda siempre la lista actual, para liberarlas al salir de la pantalla.
  const fotosRef = useRef(fotos);
  fotosRef.current = fotos;
  useEffect(() => {
    return () => fotosRef.current.forEach((f) => URL.revokeObjectURL(f.url));
  }, []);

  function actualizarPosicion(latLng) {
    setPosicion(latLng);
    setMunicipio(municipioMasCercano(latLng[0], latLng[1]));
  }

  function agregarFotos(e) {
    const nuevas = [...e.target.files].map((archivo) => ({
      id: crypto.randomUUID(),
      url: URL.createObjectURL(archivo),
    }));
    setFotos((actuales) => [...actuales, ...nuevas].slice(0, 4));
    e.target.value = ''; // permite volver a elegir el mismo archivo
  }

  function quitarFoto(id) {
    setFotos((actuales) => {
      const foto = actuales.find((f) => f.id === id);
      if (foto) URL.revokeObjectURL(foto.url);
      return actuales.filter((f) => f.id !== id);
    });
  }

  async function enviar(e) {
    e.preventDefault();
    if (!posicion) {
      setError(new Error('Marca la ubicación del problema tocando el mapa.'));
      return;
    }
    setError(null);
    setEnviando(true);
    try {
      // Las fotos NO se envían todavía (MVP): solo los datos del reporte.
      const { reporte } = await api('/reportes', {
        method: 'POST',
        body: {
          categoria: categoria.slug,
          titulo,
          descripcion,
          latitud: Number(posicion[0].toFixed(6)),
          longitud: Number(posicion[1].toFixed(6)),
          municipio,
          anonimo,
        },
      });
      navigate('/reporte-enviado', { replace: true, state: { reporte } });
    } catch (err) {
      setError(err);
      setEnviando(false);
    }
  }

  const textoUbicacion = {
    buscando: 'Buscando tu ubicación…',
    gps: 'Detectada con tu GPS',
    mapa: 'Marcada en el mapa',
    manual: 'Toca el mapa para marcar el lugar',
  }[origenUbicacion];

  return (
    <form onSubmit={enviar} className="formulario-paso">
      <div className="contenido formulario">
        <div className="categoria-elegida">
          <CategoriaIcono slug={categoria.slug} color={categoria.color} tamano={32} />
          <span>{categoria.nombre}</span>
        </div>

        <label className="campo">
          <span>Título</span>
          <input
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Ej.: Falta de agua potable"
            maxLength={80}
            required
          />
        </label>

        <label className="campo">
          <span>Describe el problema</span>
          <textarea
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="¿Qué pasa? ¿Desde cuándo? ¿A quién afecta?"
            rows={4}
            maxLength={1000}
            required
          />
        </label>

        <div className="campo">
          <span>Evidencia fotográfica</span>
          <div className="fotos">
            {fotos.length === 0 && (
              <div className="foto foto-vacia">
                <Camera size={26} />
              </div>
            )}
            {fotos.map((f) => (
              <div key={f.id} className="foto">
                <img src={f.url} alt="Foto adjunta" />
                <button type="button" aria-label="Quitar foto" onClick={() => quitarFoto(f.id)}>
                  <X size={14} />
                </button>
              </div>
            ))}
            {fotos.length < 4 && (
              <button type="button" className="foto foto-agregar" onClick={() => inputFotos.current.click()}>
                <Plus size={22} />
                <span>Añadir</span>
              </button>
            )}
          </div>
          {/* capture="environment" abre la cámara trasera en el celular */}
          <input
            ref={inputFotos}
            type="file"
            accept="image/*"
            capture="environment"
            multiple
            hidden
            onChange={agregarFotos}
          />
          <small className="texto-2">Las fotos todavía no se envían al servidor.</small>
        </div>

        <div className="campo">
          <span>Ubicación</span>
          <div className="card ubicacion">
            <div className="mini-mapa">
              <MapContainer
                center={posicion ?? CENTRO_GUAJIRA}
                zoom={posicion ? 13 : 8}
                zoomControl={false}
                attributionControl={false}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <SelectorDePunto
                  posicion={posicion}
                  alMarcar={(latLng) => {
                    actualizarPosicion(latLng);
                    setOrigenUbicacion('mapa');
                  }}
                />
              </MapContainer>
            </div>
            <div className="ubicacion-texto">
              <select
                value={municipio}
                onChange={(e) => setMunicipio(e.target.value)}
                required
                aria-label="Municipio"
              >
                <option value="" disabled>
                  Elige el municipio
                </option>
                {MUNICIPIOS.map((m) => (
                  <option key={m.nombre} value={m.nombre}>
                    {m.nombre}
                  </option>
                ))}
              </select>
              <span className="texto-2 pequeno">
                <LocateFixed size={14} /> {textoUbicacion}
              </span>
            </div>
          </div>
        </div>

        <label className="card interruptor">
          <Shield size={22} className="texto-2" />
          <div>
            <strong>Reporte anónimo</strong>
            <span className="texto-2 pequeno">Tu nombre no se mostrará a la comunidad</span>
          </div>
          <input
            type="checkbox"
            role="switch"
            checked={anonimo}
            onChange={(e) => setAnonimo(e.target.checked)}
          />
        </label>

        <MensajeError error={error} />
      </div>

      <div className="pie-fijo">
        <button type="submit" className="btn btn-primario" disabled={enviando}>
          {enviando ? 'Enviando…' : 'Enviar reporte'}
        </button>
      </div>
    </form>
  );
}

// Componente "invisible" dentro del mapa: escucha los clics y mueve la vista
// cuando llega la posición del GPS. useMap/useMapEvents solo funcionan dentro de MapContainer.
function SelectorDePunto({ posicion, alMarcar }) {
  const map = useMap();
  useMapEvents({
    click: (e) => alMarcar([e.latlng.lat, e.latlng.lng]),
  });
  useEffect(() => {
    if (posicion) map.setView(posicion, Math.max(map.getZoom(), 13));
  }, [posicion, map]);

  if (!posicion) return null;
  return (
    <CircleMarker
      center={posicion}
      radius={9}
      pathOptions={{ color: '#fff', weight: 3, fillColor: '#3B73C4', fillOpacity: 1 }}
    />
  );
}
