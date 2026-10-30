import { Navigate, Route, Routes } from 'react-router';
import { RutaProtegida } from './components/RutaProtegida.jsx';
import Login from './pages/auth/Login.jsx';
import Mapa from './pages/ciudadano/Mapa.jsx';
import NuevoReporte from './pages/ciudadano/NuevoReporte.jsx';
import ReporteEnviado from './pages/ciudadano/ReporteEnviado.jsx';
import MisReportes from './pages/ciudadano/MisReportes.jsx';
import DetalleReporte from './pages/ciudadano/DetalleReporte.jsx';
import Perfil from './pages/ciudadano/Perfil.jsx';
import Panel from './pages/panel/Panel.jsx';

// Mapa de URLs → pantallas.
export default function App() {
  const protegida = (pagina, roles) => <RutaProtegida roles={roles}>{pagina}</RutaProtegida>;

  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* App ciudadana */}
      <Route path="/" element={protegida(<Mapa />)} />
      <Route path="/reportar" element={protegida(<NuevoReporte />)} />
      <Route path="/reporte-enviado" element={protegida(<ReporteEnviado />)} />
      <Route path="/mis-reportes" element={protegida(<MisReportes />)} />
      <Route path="/reportes/:id" element={protegida(<DetalleReporte />)} />
      <Route path="/perfil" element={protegida(<Perfil />)} />

      {/* Panel institucional: solo autoridad o admin */}
      <Route path="/panel" element={protegida(<Panel />, ['autoridad', 'admin'])} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
