---
name: deploy-checklist
description: "Antes de subir a producción — checklist completo de código, seguridad, UI y docs"
metadata:
  kind: workflow
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

- [ ] `ui-reviewer` (o `auditor` en Antigravity) sin Critical sobre la interfaz de esta versión: cubre estados de UI, responsive, contraste y movimiento reducido según la rule `ui-ux`

### SEO (si aplica)

- [ ] `<title>` y `<meta description>` únicos por página
- [ ] `<link rel="canonical">` presente
- [ ] Lighthouse SEO score ≥ 90
- [ ] Lighthouse Performance score ≥ 80

### Versión (si el proyecto tiene número de versión)

Aplica cuando el proyecto declara su versión: `package.json` de una librería o
paquete publicado, `pyproject.toml`, la cabecera de `style.css` de un tema de
WordPress o la del archivo principal de un plugin, una app con tienda. Un sitio
que se despliega solo y no tiene número de versión se saltea.

- [ ] Número subido según los commits desde la última versión (`git log --oneline <último-tag>..HEAD`; sin tags, desde el último commit que cambió el número): un cambio incompatible (`feat!`, `fix!` o `BREAKING CHANGE`) sube el primero, un `feat` el del medio y un `fix` el último. Solo `docs`, `chore` o `refactor` no suben nada
- [ ] El mismo número en todos los lugares donde aparece: por ejemplo, la cabecera de WordPress y la constante de versión que usa el tema o plugin para cargar CSS y JS (si no sube, el navegador sigue usando los archivos viejos)
- [ ] `04_CHANGELOG.md`: el título de la fecha lleva el número nuevo (`## 2026-01-15 — v1.4.0`)
- [ ] Si el proyecto usa tags, `vX.Y.Z` sobre el commit que se despliega

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
