import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router';
import { MessageCircle } from 'lucide-react';
import { esInstitucional, useAuth } from '../../lib/AuthContext.jsx';
import { APP_NOMBRE } from '../../lib/constantes.js';
import { MensajeError, PantallaMovil } from '../../components/ui.jsx';

export default function Login() {
  const { usuario, login, registro } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [modo, setModo] = useState('ingresar'); // 'ingresar' | 'crear'
  const [nombre, setNombre] = useState('');
  const [identificador, setIdentificador] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [enviando, setEnviando] = useState(false);

  // Si ya hay sesión, no tiene sentido ver el login.
  if (usuario) return <Navigate to={esInstitucional(usuario) ? '/panel' : '/'} replace />;

  function irDespuesDeEntrar(u) {
    if (esInstitucional(u)) return navigate('/panel', { replace: true });
    navigate(location.state?.desde ?? '/', { replace: true });
  }

  async function enviar(e) {
    e.preventDefault(); // evita que el formulario recargue la página
    setError(null);
    setEnviando(true);
    try {
      let u;
      if (modo === 'ingresar') {
        u = await login(identificador, password);
      } else {
        // Un solo campo "Correo o teléfono": si tiene @ es correo, si no, teléfono.
        const esCorreo = identificador.includes('@');
        u = await registro({
          nombre,
          email: esCorreo ? identificador : undefined,
          telefono: esCorreo ? undefined : identificador.replace(/\s/g, ''),
          password,
        });
      }
      irDespuesDeEntrar(u);
    } catch (err) {
      setError(err);
    } finally {
      setEnviando(false);
    }
  }

  function cambiarModo(nuevo) {
    setModo(nuevo);
    setError(null);
  }

  return (
    <PantallaMovil className="login">
      <div className="login-logo">
        <MessageCircle size={36} />
      </div>
      <h1 className="titulo-grande">{APP_NOMBRE}</h1>
      <p className="texto-2 login-sub">Reporta los problemas de tu comunidad. Tu voz cuenta.</p>

      <div className="segmentado" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={modo === 'ingresar'}
          className={modo === 'ingresar' ? 'activo' : ''}
          onClick={() => cambiarModo('ingresar')}
        >
          Ingresar
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={modo === 'crear'}
          className={modo === 'crear' ? 'activo' : ''}
          onClick={() => cambiarModo('crear')}
        >
          Crear cuenta
        </button>
      </div>

      <form onSubmit={enviar} className="formulario">
        {modo === 'crear' && (
          <label className="campo">
            <span>Nombre</span>
            <input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Tu nombre"
              autoComplete="name"
              required
            />
          </label>
        )}
        <label className="campo">
          <span>Correo o teléfono</span>
          <input
            value={identificador}
            onChange={(e) => setIdentificador(e.target.value)}
            placeholder="ejemplo@correo.com"
            autoComplete="username"
            required
          />
        </label>
        <label className="campo">
          <span>Contraseña</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={modo === 'crear' ? 'Mínimo 8 caracteres' : '••••••••'}
            autoComplete={modo === 'crear' ? 'new-password' : 'current-password'}
            required
          />
        </label>

        <MensajeError error={error} />

        <button type="submit" className="btn btn-primario" disabled={enviando}>
          {enviando ? 'Un momento…' : modo === 'ingresar' ? 'Ingresar' : 'Crear cuenta'}
        </button>
        {modo === 'ingresar' && (
          <button type="button" className="btn btn-borde" onClick={() => cambiarModo('crear')}>
            Crear cuenta nueva
          </button>
        )}
      </form>

      <div className="aviso-info">
        <strong>Cuentas de prueba</strong> (contraseña <code>demo1234</code>)
        <br />
        Ciudadano: <code>ciudadano@vozguajira.co</code>
        <br />
        Autoridad: <code>autoridad@vozguajira.co</code>
      </div>
    </PantallaMovil>
  );
}
