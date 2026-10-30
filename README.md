# Voz Guajira — MVP

Plataforma de reporte ciudadano para La Guajira. Monorepo con dos carpetas:

```
vozGuajira/
├── server/   API REST — Node.js + Express + PostgreSQL
└── client/   App web — React + Vite + Leaflet
```

## Requisitos

- Node.js 22.22 o superior (`node -v`)
- PostgreSQL corriendo en tu Mac (`pg_isready` debe decir `accepting connections`)

## Puesta en marcha (la primera vez)

```bash
# 1. Base de datos
createdb voz_guajira

# 2. Backend
cd server
npm install
cp .env.example .env        # y edita .env (ver abajo)
npm run migrate             # crea las tablas
npm run seed                # carga usuarios y reportes de prueba
npm run dev                 # API en http://localhost:3000

# 3. Frontend (en otra terminal)
cd client
npm install
npm run dev                 # app en http://localhost:5173
```

En `server/.env`:

- `DATABASE_URL`: cambia `alejandro` por tu usuario de Postgres (columna *Owner* de `psql -l`).
- `JWT_SECRET`: genera uno con
  `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

Abre **http://localhost:5173** y entra con una cuenta de prueba (contraseña `demo1234`):

| Rol | Correo | Entra a |
|---|---|---|
| Ciudadano | `ciudadano@vozguajira.co` | App móvil (mapa, reportar, mis reportes) |
| Autoridad | `autoridad@vozguajira.co` | Panel institucional (`/panel`) |

## Qué incluye el MVP

- Registro e inicio de sesión con correo o teléfono (JWT + bcrypt), roles ciudadano / autoridad / admin.
- Mapa con los reportes (OpenStreetMap), filtro por categoría y búsqueda.
- Nuevo reporte en 2 pasos: categoría → título, descripción, fotos (solo vista previa), ubicación por GPS o tocando el mapa, municipio y opción anónima.
- Mis reportes con filtro por estado y detalle con línea de tiempo del seguimiento.
- Panel institucional: conteos, tabla filtrable y cambio de estado con observación (queda en el historial).

**Fuera del MVP (por ahora):** modo sin conexión, subida real de fotos, "Me pasa lo mismo", comentarios, notificaciones, mapa de calor, estadísticas, exportar PDF, administración.

## Estructura del backend (monolito modular en capas)

```
server/
├── db/migrations/        SQL numerado: 001_usuarios.sql … 005_evidencias.sql
├── scripts/              migrate.js y seed.js
└── src/
    ├── index.js          arranca el servidor (app.listen)
    ├── app.js            define la app: middlewares + rutas de cada módulo
    ├── config.js         lee y valida las variables de .env
    ├── db/pool.js        conexión a Postgres + helper de transacciones
    ├── middleware/       auth (JWT y roles) y errorHandler
    └── modules/
        ├── auth/         registro, login, /yo
        ├── categorias/   lista de categorías
        └── reportes/     crear, listar, detalle, cambiar estado
```

Cada módulo tiene tres capas, y cada una solo habla con la de abajo:

- **routes** → recibe la petición HTTP, valida con Zod y responde.
- **service** → la lógica de negocio (reglas, máquina de estados, transacciones).
- **repository** → el único lugar con SQL.

## API

| Método | Ruta | Acceso |
|---|---|---|
| GET | `/api/health` | público |
| POST | `/api/auth/registro` · `/api/auth/login` | público |
| GET | `/api/auth/yo` | con sesión |
| GET | `/api/categorias` | público |
| GET | `/api/reportes?categoria=&estado=&municipio=&q=` | público |
| GET | `/api/reportes/:id` | público |
| GET | `/api/reportes/mios` | con sesión |
| POST | `/api/reportes` | con sesión |
| GET | `/api/reportes/resumen` | autoridad / admin |
| PATCH | `/api/reportes/:id/estado` | autoridad / admin |

## Notas

- **Migraciones:** nunca edites un archivo que ya corrió. Para cambiar una tabla, crea `006_...sql` con un `ALTER TABLE` y corre `npm run migrate`.
- **Nombre de la app:** se cambia en un solo lugar, `client/src/lib/constantes.js` (`APP_NOMBRE`).
- El mapa necesita internet para cargar las imágenes de OpenStreetMap.
