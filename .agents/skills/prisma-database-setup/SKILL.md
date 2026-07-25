---
name: prisma-database-setup
description: >
  Guía oficial de Prisma para diseñar schema, configurar el datasource y
  correr migraciones — PostgreSQL, MySQL y el resto de providers soportados.
  Usar al iniciar un proyecto con Prisma, al diseñar o modificar el schema
  (`schema.prisma`), o al configurar migraciones por primera vez.
  Relevante para proyectos con backend PostgreSQL relacional grande (ej. un
  CRM con decenas de tablas).
source: prisma/skills
install: "npx skills add prisma/skills --skill prisma-database-setup"
---

# Prisma Database Setup

Skill oficial del equipo de Prisma.

## Cuándo activarla

Al iniciar un proyecto nuevo con Prisma, al agregar o modificar modelos en
`schema.prisma`, al configurar el `datasource` (PostgreSQL, MySQL, SQLite,
etc.), o al correr `prisma migrate` por primera vez en un entorno.

Útil en particular para proyectos con un schema relacional grande — muchas
tablas con relaciones entre sí — donde un mal diseño temprano del schema
es caro de corregir después.

## Instalación

```bash
npx skills add prisma/skills --skill prisma-database-setup
```

## Flujo de uso

1. Definir o revisar el `datasource` y el provider (`postgresql`, `mysql`,
   etc.) en `schema.prisma`.
2. Diseñar/ajustar modelos y relaciones siguiendo las convenciones oficiales
   de Prisma antes de generar la migración.
3. Correr `prisma migrate dev` (desarrollo) o `prisma migrate deploy`
   (producción) según corresponda.
