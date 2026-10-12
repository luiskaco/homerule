---
description: "Antes de subir a producción — checklist completo de código, seguridad, UI y docs"
---

# Workflow: Deploy Checklist

# Invocar con: /deploy-checklist

Ejecutar y verificar cada ítem antes de hacer merge a main o deploy a producción.

> **Primer lanzamiento** (o cambio que agrega login, pagos, formularios con
> datos personales o correo promocional): además de este checklist, correr la
> skill `prelaunch-compliance-audit` — cubre lo legal, privacidad y
> consentimiento, que este checklist no revisa.

---

## 🚀 Checklist Pre-Deploy

### Código

- [ ] Build exitoso sin errores
- [ ] Consola limpia (sin warnings ni errores)
- [ ] Sin `console.log` de debug en producción
- [ ] Sin credenciales hardcodeadas (`git grep -i "api_key\|password\|secret"`)
- [ ] Linter sin errores
- [ ] Flujo completo probado — no solo que compile

### Seguridad

- [ ] `npm audit --audit-level=high` sin vulnerabilidades críticas
- [ ] Variables de entorno documentadas en `.env.example`
- [ ] Headers de seguridad configurados
- [ ] RBAC verificado en endpoints nuevos o modificados
- [ ] Sin stack traces expuestos en respuestas de error

### UI (si aplica)

- [ ] 5 estados de UI implementados (loading, skeleton, error, success, empty)
- [ ] Responsive verificado: 320px, 768px, 1280px
- [ ] Contraste WCAG AA (4.5:1 mínimo)
- [ ] Sin imágenes sin `width`/`height` explícitos (CLS)
- [ ] `prefers-reduced-motion` respetado

### SEO (si aplica)

- [ ] `<title>` y `<meta description>` únicos por página
- [ ] `<link rel="canonical">` presente
- [ ] Lighthouse SEO score ≥ 90
- [ ] Lighthouse Performance score ≥ 80

### Documentación

- [ ] `/docs` actualizado si hubo cambios de arquitectura, API o datos
- [ ] `08_CHANGELOG.md` actualizado con la versión
- [ ] `10_RUNBOOK.md` al día: pasos de deploy y rollback probados, verificación post-deploy definida
- [ ] `09_TESTING.md`: los requisitos de esta versión tienen test en la tabla de trazabilidad
- [ ] `.env.example` actualizado si se agregaron variables nuevas

### Commit final

`tipo(scope): descripción en imperativo`
