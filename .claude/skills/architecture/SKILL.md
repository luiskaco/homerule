---
name: architecture
description: "Activar al crear un módulo, archivo o feature nueva, o al decidir en qué carpeta/capa va un componente, servicio o endpoint"
---

# Architecture Rules

## Estructura por Capas

```
UI → Lógica de negocio → Acceso a datos
```

Ninguna capa salta a otra. El frontend no contiene lógica de negocio.

## Modularidad Vertical (por dominio)

Un módulo = una carpeta en cada capa. Sin mezclar.

```
✅ app/[modulo]/          → rutas y páginas
   components/[modulo]/   → componentes
   lib/[modulo]/          → servicios, tipos, mocks

❌ components/
   lib/
   utils/                 → archivos mezclados de distintos módulos
```

- Compartido entre módulos → `components/ui/` o `lib/shared/`
- Comunicación entre módulos solo a través de interfaces/contratos — nunca importando internals
- Archivo nuevo siempre en la carpeta de su módulo

## Carpetas por stack

Respetar la estructura del framework y agregar los módulos adentro. En un
proyecto que ya existe, manda la estructura que tiene.

```
Next.js (App Router)            Laravel
app/[modulo]/   rutas           app/Http/Controllers/  delgados
components/ui/  compartidos     app/Http/Requests/     validación
components/[modulo]/            app/Models/
lib/[modulo]/   servicios       app/Services/ o Actions/  lógica de negocio
lib/shared/                     routes/  database/migrations/
tests/ o junto al archivo       tests/Feature/  tests/Unit/

Node (API con Express/Fastify)  FastAPI
src/app.ts      arma la app     app/main.py
src/modules/[modulo]/           app/api/v1/     routers
  routes  controller            app/schemas/    Pydantic
  service  schema  repository   app/services/   lógica
src/shared/     middlewares     app/models/  app/db/
src/config/     env y ajustes   app/core/       config y seguridad
tests/                          tests/

Tema de WordPress (bloques)     CSS puro o Sass, por capas (@layer)
theme.json  style.css           styles/main.css   solo importa, en orden:
templates/  parts/  patterns/   styles/reset/
functions.php  solo carga inc/  styles/tokens/    variables
inc/        PHP del tema        styles/base/      etiquetas HTML
assets/     CSS, JS, imágenes   styles/layout/    grillas y contenedores
                                styles/components/  un archivo por componente
                                styles/utilities/
```

Con CSS por capas, el orden de `@layer` decide qué gana, sin `!important`. Con
Tailwind casi no hacen falta carpetas: los tokens van en el tema y quedan pocos
archivos de componentes.

### Antes de crear un archivo

1. **Buscar si ya existe** algo que haga lo mismo o un archivo donde encaje.
2. **Ubicarlo en su módulo y su capa:** pantalla, API, lógica o datos del área
   a la que pertenece. Si no encaja en ningún módulo, es compartido o falta un
   módulo nuevo: decidirlo, no dejarlo suelto.
3. **Nombrarlo por lo que hace,** en inglés y `kebab-case` (o la convención del
   framework: `PascalCase` para componentes y clases).

### Lo que no va

- Archivos sueltos en la raíz: ahí solo van la configuración del proyecto
  (`package.json`, `composer.json`, `.env.example`, configs de herramientas),
  el `README.md` y el `AGENTS.md`.
- Carpetas cajón (`utils/`, `helpers/`, `misc/`, `new/`, `old/`) con archivos de
  distintos módulos: lo compartido va en la carpeta compartida del stack, con
  un nombre que diga qué hace.
- Copias y borradores (`archivo-v2.ts`, `copy-of-…`, `test2.php`): para eso está
  git. Lo que ya no se usa se borra.
- Scripts y pruebas sueltas: los scripts de mantenimiento van en `scripts/`, la
  documentación en `docs/` y lo temporal fuera del repo.
- La configuración sale de variables de entorno y se lee en un solo lugar
  (`config/` en Laravel y Node, `app/core/config.py` en FastAPI, `lib/env` en
  Next.js).
- Los tests replican la estructura del código: el test de
  `app/services/billing.py` está en `tests/services/test_billing.py`.

## Frontend Ligero

El frontend maneja solo:

- Presentación y estado de UI
- Llamadas a la API del backend

Nunca en el frontend:

- Lógica de negocio crítica
- Cálculos de precios, permisos o acceso
- Decisiones de autorización

## Servicios Stateless

Diseñar stateless desde el inicio. Cualquier instancia debe poder manejar cualquier request sin depender de estado local.

## Antes de escribir código nuevo

Tomar el primer escalón que resuelva todo lo pedido:

1. **¿Hace falta?** Lo que nadie pidió no se construye: se nombra en una línea.
2. **¿Ya existe en el repo?** Un helper, componente, servicio o patrón: usarlo como lo usa el código vecino.
3. **¿Lo resuelve la librería estándar o la plataforma?** Usarla, salvo que el proyecto tenga su propia pieza.
4. **¿Lo resuelve una dependencia ya instalada?** Usarla. No sumar una dependencia por pocas líneas.
5. **Recién ahí, lo mínimo que funcione**, pero completo: los llamadores, tests y fixtures que el cambio afecta.

Nunca se recorta validación en fronteras de confianza, manejo de errores que evita pérdida de datos, seguridad ni accesibilidad.

> Adaptado de [ponytail](https://github.com/dietrichgebert/ponytail) (MIT).

## Evitar Estrictamente

- Lógica de negocio en components de UI o HTTP controllers.
- Dependencias circulares entre módulos.
- God objects/services (una clase que hace todo).
- Configuración hardcodeada — todo por variables de entorno.
- Sobreingeniería en v1 — abstraer cuando haya 3+ casos de uso reales.

---

## API Design

- Versionar desde el inicio: `/api/v1/...`
- REST: recursos en plural, kebab-case (`/api/v1/blog-posts`)
- HTTP codes correctos: `200`, `201`, `400`, `401`, `403`, `404`, `422`, `429`, `500`
- Respuestas consistentes:

  ```json
  { "data": {}, "meta": {} }          // éxito
  { "error": "CODE", "message": "" }  // error
  { "errors": [{ "field": "", "message": "" }] }  // validación
  ```

- No romper contratos sin deprecation period + versión nueva.

---

## Checklist de Arquitectura

Antes de implementar un módulo o feature nuevo:

- [ ] ¿Está en la capa correcta? (UI / negocio / datos)
- [ ] ¿Introduce dependencias circulares?
- [ ] ¿El contrato de la API está definido antes del código?
- [ ] ¿El modelo de datos está en `DATA_MODEL.md`?
- [ ] ¿La decisión arquitectónica está en `03_DECISIONS.md` (ADR)?