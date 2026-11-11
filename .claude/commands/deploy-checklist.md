---
description: "Antes de subir a producción — checklist completo de código, seguridad, UI y docs"
---

# Workflow: Deploy Checklist

# Invocar con: /deploy-checklist

Ejecutar y verificar cada ítem antes de hacer merge a main o deploy a producción.
Cada ítem que falla lleva su evidencia (archivo, línea o salida del comando);
lo que no se pudo comprobar va como "a verificar", no como aprobado.

> **Primer lanzamiento** (o cambio que agrega login, pagos, formularios con
> datos personales o correo promocional): además de este checklist, correr la
> skill `prelaunch-compliance-audit` — cubre lo legal, privacidad y
> consentimiento, que este checklist no revisa.

---

## 🚀 Checklist Pre-Deploy

### Git

- [ ] Árbol limpio y sin commits sin subir (`git status -sb`)
- [ ] Sin marcadores de conflicto (`git grep -n "<<<<<<<"`)
- [ ] Rama al día con la base; alcance claro (`git log --oneline main..HEAD`)

### Código

- [ ] Build exitoso sin errores
- [ ] Consola limpia (sin warnings ni errores)
- [ ] Sin `console.log` de debug en producción
- [ ] Sin credenciales hardcodeadas (`git grep -i "api_key\|password\|secret"`)
- [ ] Linter sin errores
- [ ] Flujo completo probado — no solo que compile

### Seguridad

- [ ] `/security-audit` sin Critical confirmado, si la versión toca auth, APIs, datos sensibles o dependencias
- [ ] `npm audit --audit-level=high` sin críticas (o `pip-audit` / `composer audit`)
- [ ] Variables de entorno: las que lee el código (`process.env.X`, `import.meta.env.X`, `os.environ`) están todas en `.env.example`. Una nueva sin documentar bloquea: el deploy arranca sin ella
- [ ] `.env*` fuera del repo y en `.gitignore`

### Base de datos (si hay migraciones nuevas)

- [ ] Revisadas antes de aplicarlas: pérdida de datos, vuelta atrás, locks y compatibilidad con el código desplegado. En Claude Code, delegarlo en el subagente `db-migration-reviewer`; un "No aplicar" bloquea
- [ ] Backup reciente si alguna es irreversible

### UI (si aplica)

- [ ] `ui-reviewer` (o `frontend` en Antigravity) sin Critical sobre la interfaz de esta versión: cubre estados de UI, responsive, contraste y movimiento reducido según la rule `ui-ux`

### SEO (si aplica)

- [ ] `<title>` y `<meta description>` únicos por página
- [ ] `<link rel="canonical">` presente
- [ ] Lighthouse SEO score ≥ 90
- [ ] Lighthouse Performance score ≥ 80

### Documentación

- [ ] `/docs` actualizado si hubo cambios de arquitectura, API o datos
- [ ] `04_CHANGELOG.md` con una línea por cada cambio de esta versión
- [ ] `RUNBOOK.md` al día: pasos de deploy y rollback probados, verificación post-deploy definida
- [ ] `TESTING.md`: los requisitos de esta versión tienen test en la tabla de trazabilidad
- [ ] `.env.example` actualizado si se agregaron variables nuevas

### Veredicto

- **NO-GO** si hay al menos un bloqueante: listar cada uno con su evidencia y qué hace falta.
- **GO con reservas** si no hay bloqueantes pero queda algo "a verificar" (variables cargadas en el hosting, backup, estado de la base).
- **GO** solo con todo verificado.

### Commit final

`tipo(scope): descripción en imperativo`
