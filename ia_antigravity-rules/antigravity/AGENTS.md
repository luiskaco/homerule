# Project Rules — Antigravity
# Cross-tool: aplica en Antigravity, Cursor y Claude Code

---

## Stack & Contexto

Este es el proyecto **[NOMBRE DEL PROYECTO]**.

> ✏️ Solo actualizar las 2 líneas marcadas al iniciar un proyecto nuevo.

```
# ── Fijo (no cambiar) ────────────────────────────────
Frontend:      React / Next.js / Vanilla JS
Backend:       Node.js / Python (FastAPI)
CMS:           WordPress (tradicional)
Estilos:       Tailwind CSS / CSS puro
Runtime:       Node.js 20+ / Python 3.11+

# ── Variable por proyecto (actualizar estas 2) ───────
Nombre:        [NOMBRE DEL PROYECTO]           ✏️
Base de datos: [PostgreSQL / MySQL / MongoDB]   ✏️

# ── Variable por proyecto (si aplica) ────────────────
Frontend:      [React / Next.js / Vanilla JS]  ✏️ (si no es React/Next)
Estilos:       [Tailwind / CSS puro]            ✏️ (si no es Tailwind)

# ── Opcional (agregar si aplica) ─────────────────────
Auth:          [NextAuth / JWT / Clerk / WP Auth]
Hosting:       [Vercel / Railway / AWS / VPS]
ORM:           [Prisma / Drizzle / SQLAlchemy]
```

### Stack de referencia

Convenciones detalladas por tecnología en `.agent/rules/stack-conventions.md`.
Activar cuando se trabaje con un stack específico.


---

## Principios No Negociables

- Nunca confiar en el frontend para validaciones de seguridad o lógica de negocio.
- Todo secret va en variables de entorno — nunca hardcodeado, nunca en el repositorio.
- Versionar la API desde el inicio: `/api/v1/...`
- Mobile-first: diseñar desde 320px hacia arriba.
- Los 5 estados de UI son obligatorios: loading, skeleton, error, success, empty.
- Código en inglés. Respuestas al usuario en su idioma.

---

## Checklist Pre-deploy (ejecutar antes de cada merge a main)

### Código
- [ ] Build exitoso sin errores
- [ ] Consola limpia (sin warnings ni errores)
- [ ] Sin `console.log` de debug en producción
- [ ] Sin credenciales hardcodeadas (`git grep -i "api_key\|password\|secret"`)
- [ ] Linter sin errores

### Seguridad
- [ ] `npm audit --audit-level=high` sin vulnerabilidades
- [ ] Variables de entorno documentadas en `.env.example`
- [ ] Headers de seguridad configurados
- [ ] RBAC verificado en endpoints nuevos

### UI
- [ ] 5 estados de UI implementados en componentes nuevos
- [ ] Responsive verificado: 320px, 768px, 1280px
- [ ] Contraste WCAG AA (4.5:1 mínimo)

### Documentación
- [ ] `/docs` actualizado si hubo cambios de arquitectura, API o datos
- [ ] `08_CHANGELOG.md` actualizado con la versión
