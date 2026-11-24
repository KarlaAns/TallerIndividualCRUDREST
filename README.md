# Sistema Bibliotecario

Taller individual CRUD REST · Microservicio 1: **Identidad y usuarios**
(persona, usuario, rol y usuario_rol) con NestJS, TypeORM y PostgreSQL 17 en Docker.

## Estructura

```
TallerIndividualCRUDREST/
├── backend/                       # NestJS + TypeORM
│   └── src/
│       ├── common/                # errores de PostgreSQL -> HTTP 409
│       ├── persona/               # dto/, entities/, controller, module, service
│       ├── usuario/
│       ├── rol/
│       ├── usuario-rol/
│       ├── app.module.ts          # módulos y conexión TypeORM
│       └── main.ts                # arranque y ValidationPipe
├── database/
│   ├── 01_schema.sql              # tablas persona, usuario, rol, usuario_rol
│   └── 02_datos_iniciales.sql     # roles y credenciales provisionales
├── pruebas/
│   └── pruebas-rest.ps1           # pruebas con Invoke-RestMethod
├── .env                           # contraseña local (no se sube a Git)
├── .gitignore
├── docker-compose.yml
└── README.md
```

## Puesta en marcha

1. Crear `.env` en la raíz con `POSTGRES_PASSWORD=contraseña`.
2. Levantar PostgreSQL y crear las tablas:

```powershell
docker compose up -d
Get-Content database/01_schema.sql | docker compose exec -T postgres psql -U biblioteca -d biblioteca_db
Get-Content database/02_datos_iniciales.sql | docker compose exec -T postgres psql -U biblioteca -d biblioteca_db
```

3. Ejecutar el backend:

```powershell
cd backend
npm install
npm run start:dev
```

4. En otra terminal, desde la raíz: `powershell -ExecutionPolicy Bypass -File .\pruebas\pruebas-rest.ps1`

## Credenciales provisionales

| Rol      | Email (username)    | Contraseña |
|----------|---------------------|------------|
| Operador | admin@example.com   | Admin12345 |
| Cliente  | cliente@example.com | Cliente123 |

Se guardan con hash bcrypt; la API nunca devuelve `password_hash`.

## Endpoints

| Recurso | Rutas |
|---|---|
| Persona | `POST /persona` · `GET /persona` · `GET/PATCH/DELETE /persona/:id` |
| Usuario | `POST /usuario` · `GET /usuario` · `GET/PATCH/DELETE /usuario/:id` |
| Rol | `POST /rol` · `GET /rol` · `GET/PATCH/DELETE /rol/:id` |
| UsuarioRol | `POST /usuario-rol` · `GET /usuario-rol` · `GET/PATCH/DELETE /usuario-rol/:id` |

## Reglas

- Persona y Usuario son entidades distintas; cada usuario corresponde a una sola persona (HTTP 409 si ya tiene).
- `identificacion`, `username` y `rol.nombre` son únicos (HTTP 409).
- La contraseña tiene al menos 8 caracteres y se guarda con hash.
- Un usuario no recibe el mismo rol dos veces: `UNIQUE (id_usuario, id_rol)`. Revocar = `PATCH estado=false` o `DELETE`.
- No se elimina una persona con usuario, un usuario con roles ni un rol asignado (HTTP 409).
- Datos inválidos: HTTP 400. Id inexistente: HTTP 404.

## Ramas

`master` (estable) · `pruebas` (verificación) · `desarrollo` (trabajo diario)
