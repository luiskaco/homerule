# Project Rules — Antigravity
# Cross-tool: aplica en Antigravity, Cursor y Claude Code

---

## Stack & Contexto

Este es el proyecto **[NOMBRE DEL PROYECTO]**.
Actualizar esta sección con el stack real antes de usar estas reglas.

```
Frontend:  [framework]
Backend:   [framework/runtime]
Base de datos: [motor]
CMS:       [headless/tradicional — cuál]
Auth:      [solución de auth]
Hosting:   [plataforma]
```

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
