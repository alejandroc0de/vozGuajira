import { useCallback, useEffect, useState } from 'react';
import { api } from './api.js';

// Hook para PEDIR datos (GET) y manejar cargando/error en un solo lugar.
// Uso:  const { data, cargando, error, recargar } = useApi('/reportes');
// Cuando "ruta" cambia (ej.: un filtro), vuelve a pedir los datos solo.
// Es una versión simple de lo que hace TanStack Query.
export function useApi(ruta) {
  const [data, setData] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    // "activo" evita guardar la respuesta de una petición vieja
    // si el usuario cambió de filtro antes de que llegara.
    let activo = true;
    setCargando(true);
    setError(null);
    api(ruta)
      .then((d) => activo && setData(d))
      .catch((e) => activo && setError(e))
      .finally(() => activo && setCargando(false));
    return () => {
      activo = false;
    };
  }, [ruta, version]);

  const recargar = useCallback(() => setVersion((v) => v + 1), []);
  return { data, cargando, error, recargar };
}
