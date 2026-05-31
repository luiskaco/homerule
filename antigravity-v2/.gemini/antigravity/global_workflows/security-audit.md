# Workflow: Auditoría de Seguridad
# Invocar con: /security-audit
# Usar antes de subir cualquier feature con auth, APIs o datos sensibles

---

## 🔒 Security Audit

### 1. OWASP Top 10 — Verificación rápida

- [ ] **Injection** — ¿Hay queries con inputs del usuario sin parametrizar?
- [ ] **Broken Access Control** — ¿Cada endpoint verifica permisos en el servidor?
- [ ] **Cryptographic Failures** — ¿Passwords con bcrypt/Argon2id? ¿HTTPS activo?
- [ ] **Security Misconfiguration** — ¿Headers de seguridad configurados? ¿Stack traces ocultos?
- [ ] **Vulnerable Dependencies** — ¿`npm audit` o `pip audit` sin vulnerabilidades críticas?
- [ ] **SSRF** — ¿URLs externas validadas con allowlist?
- [ ] **XSS** — ¿Outputs sanitizados? ¿Sin `innerHTML` con data del usuario?
- [ ] **IDOR** — ¿Se verifica que el usuario tiene acceso al recurso solicitado por ID?

### 2. Autenticación y Tokens
- [ ] Tokens almacenados en cookies `HttpOnly` + `Secure` — nunca `localStorage`
- [ ] Refresh token rotation implementada
- [ ] Rate limiting activo en endpoints de auth (20 req/min)
- [ ] Logout invalida el token en el servidor

### 3. Secrets y Variables
- [ ] Sin credenciales hardcodeadas (`git grep -i "api_key\|password\|secret\|token"`)
- [ ] `.env.example` actualizado con variables nuevas
- [ ] API keys con scope mínimo

### 4. Datos Sensibles
- [ ] Logs sin passwords, tokens ni PII
- [ ] Respuestas de error genéricas — sin stack traces al cliente
- [ ] Uploads validados por tipo MIME en el servidor

### Resultado
Si hay hallazgos — listarlos con severidad:
- 🔴 **Critical** — bloquea el deploy, corregir antes de subir
- 🟠 **High** — corregir en el próximo commit
- 🟡 **Medium** — agregar a `06_TASKS.md` como tarea pendiente

---

**Si todo está limpio:** proceder con `/deploy-checklist`
