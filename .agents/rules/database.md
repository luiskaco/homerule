---
trigger: model_decision
description: Activar al diseñar schema, escribir migraciones, elegir ORM, o trabajar con PostgreSQL, MySQL, MongoDB, Supabase o SQLite — pooling, índices, seguridad de credenciales
---

# Database Rules

### Elección de motor

- **Datos relacionales con integridad referencial fuerte** → PostgreSQL (default recomendado)
- **Hosting compartido / stack LAMP existente** → MySQL
- **Datos semi-estructurados, esquema variable, alto volumen de escritura** → MongoDB
- **Necesitás auth + DB + storage + realtime integrados rápido** → Supabase (Postgres por debajo)
- **App local, embebida, herramienta interna o un solo servidor con pocas escrituras simultáneas** → SQLite (un archivo, sin servidor de base de datos)

### Conexión y pooling

- Nunca abrir una conexión nueva por request — usar pool (`pg-pool`, `mysql2/promise` pool, driver nativo de Mongo con `maxPoolSize`).
- Serverless (Vercel, Lambda): usar un pooler externo (Supabase Pooler, PgBouncer, Neon/PlanetScale built-in) — nunca el puerto directo de Postgres desde una función serverless.
- Una connection string por ambiente (dev/staging/prod), nunca hardcodeada — siempre variable de entorno.
- **SQLite:** activar `journal_mode=WAL` y `busy_timeout`, y una sola conexión de escritura por proceso. No sirve en serverless con disco efímero: el archivo se pierde entre ejecuciones.

### Migraciones

- ORM/migration tool obligatorio en SQL: Prisma, Drizzle o Sequelize (Node) / Alembic (Python + SQLAlchemy).
- Nunca editar el schema de producción a mano (`ALTER TABLE` manual) — todo cambio pasa por una migración versionada y reproducible.
- Migraciones reversibles cuando sea posible (`down` migration) — si no lo es (drop de columna con datos), documentarlo en `03_DECISIONS.md`.
- MongoDB: aunque no tiene schema rígido, versionar los cambios de forma de documento igual (script de migración de datos, no solo de código).

### Índices

- Toda columna usada en `WHERE`, `JOIN` o `ORDER BY` frecuente necesita índice — verificar con `EXPLAIN ANALYZE` (Postgres/MySQL) antes de asumir que hace falta.
- Índices compuestos: el orden de las columnas importa — la más selectiva/usada en filtros exactos va primero.
- MongoDB: índice explícito para cualquier campo de query fuera de `_id`; usar `explain()` para confirmar que se usa.

### Seguridad

- Nunca credenciales de DB en el código o en el repo — variable de entorno, secret manager, o `.env` en `.gitignore`.
- **SQLite:** el archivo de la base (`*.db`, `*.sqlite` y sus `-wal`/`-shm`) va en `.gitignore` y fuera de la carpeta pública del servidor.
- Usuario de aplicación con permisos mínimos (no el superusuario/root de la DB) — sin `DROP`/`ALTER` en producción salvo el usuario de migraciones.
- **Supabase:** Row Level Security (RLS) obligatorio en toda tabla expuesta vía API pública — nunca confiar solo en la lógica del frontend.
- Sanitizar/parametrizar siempre — nunca concatenar input de usuario en una query SQL (previene inyección) ni en un filtro de Mongo (previene NoSQL injection vía operadores `$where`/`$ne`).

### Backups

- Automáticos diarios como mínimo, con verificación de restore periódica (ver `operations.md` para infraestructura general).
- Point-in-time recovery habilitado en producción cuando el proveedor lo ofrezca (Supabase, RDS, Atlas).
- **SQLite:** nunca copiar el archivo con la base abierta; usar `.backup` o `VACUUM INTO`, o replicación continua (Litestream).
