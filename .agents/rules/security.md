---
trigger: model_decision
description: Activar al escribir o revisar autenticación, endpoints de API, validación de inputs, uploads, manejo de secrets, CORS, o cualquier código que reciba datos del cliente
---

# Security Rules

## Regla de Oro

> **Nunca confiar en el frontend.** Todo dato del cliente es potencialmente malicioso.
> Validar, sanitizar y autorizar en el servidor, siempre.

---

## OWASP Top 10 — Mitigación Obligatoria

| Vulnerabilidad | Mitigación |
|----------------|-----------|
| Injection | Queries parametrizadas / ORM. Nunca concatenar inputs. |
| Broken Access Control | RBAC en el servidor, verificar en cada endpoint. |
| Cryptographic Failures | HTTPS, bcrypt/Argon2id, no MD5/SHA1 para passwords. |
| Security Misconfiguration | Headers de seguridad, no exponer stack traces. |
| Vulnerable Dependencies | `npm audit` en CI, mantenedor activo. |
| SSRF | Allowlist URLs externas, bloquear IPs privadas (10.x, 172.16.x, 192.168.x, 169.254.x). |
| XSS | Sanitizar outputs, CSP, nunca `innerHTML` con data del usuario. |
| IDOR | Validar que el usuario tiene acceso al recurso solicitado por ID. |
| Security Logging | Loggear auth failures, cambios de privilegios, acciones sensibles. |

---

## Autenticación

- **Hashing:** `Argon2id` (preferido) o `bcrypt` con cost factor ≥ 12. Nunca MD5/SHA1.
- **Passwords:** longitud ≥ 8, verificar contra HaveIBeenPwned API.
- **Access token:** JWT ≤ 15 minutos de expiración.
- **Refresh token:** Rotación en cada uso — invalidar el anterior al emitir uno nuevo.
- **Almacenamiento:** Cookies `HttpOnly` + `Secure` + `SameSite=Strict`. Nunca `localStorage`.
- **Logout:** Invalidar refresh token en el servidor, no solo borrar cookie del cliente.
- **Session fixation:** Regenerar session ID post-autenticación.
- **Brute force:** 5 intentos → 15 min espera. 10 intentos → bloqueo de cuenta.
- **MFA:** Modelo de usuario con `mfa_enabled` y `mfa_secret` desde v1 (TOTP/WebAuthn).

---

## Rate Limiting

| Contexto | Límite |
|----------|--------|
| General (APIs) | 100 req/min por IP |
| Endpoints de auth | 20 req/min por IP |
| Password reset / sensibles | 5 req/min por IP |
| Uploads | 10 req/min por usuario |

---

## Headers de Seguridad (obligatorios)

```
Content-Security-Policy: default-src 'self'; script-src 'self'; object-src 'none'
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

---

## Validación de Requests

- Schema completo en cada request (body, params, query, headers) — usar Zod, Joi o Pydantic.
- Rechazar campos no esperados (no silent ignore).
- Validar `Content-Type`.
- Payload máximo: **10MB** por defecto, reducir donde no se necesite.

---

## Secrets

- Nunca en el código ni en el repositorio.
- `.env` + `.gitignore` + `.env.example` actualizado siempre.
- App debe fallar con error claro si falta variable requerida.
- API keys con scope mínimo. Keys separadas por ambiente (dev/staging/prod).

```bash
# .env.example
DATABASE_URL=postgres://user:password@localhost:5432/dbname
JWT_SECRET=your-secret-here-min-32-chars
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d
```

---

## Dependencias

- `npm audit --audit-level=high` debe pasar en CI antes de deploy.
- Lockfiles siempre commiteados.
- Revisar mantenedor + descargas + último update antes de instalar una nueva.

---

## Prohibido

- `localStorage`/`sessionStorage` para tokens o datos sensibles.
- Scripts inline sin nonce en CSP.
- Stack traces en respuestas de error al cliente.
- Decisiones de autorización solo en el frontend.
- `innerHTML` / `dangerouslySetInnerHTML` con data del usuario.
