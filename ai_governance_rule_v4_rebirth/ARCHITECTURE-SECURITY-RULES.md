# Architecture & Security Rules — Antigravity

---

## 1. Arquitectura y Escalabilidad

### Principios obligatorios
- **Separación por capas:** UI → Lógica de negocio → Acceso a datos. Ninguna capa salta a otra.
- **Modularidad vertical:** Organizar por dominio/feature, no por tipo de archivo.
  ```
  ✅ /features/auth/   /features/billing/   /features/users/
  ❌ /controllers/     /models/             /utils/
  ```
- **Desacoplamiento:** Comunicación entre módulos solo a través de interfaces/contratos definidos, nunca importando internals de otro módulo.
- **Frontend ligero:** El frontend solo maneja presentación y estado de UI. Cero lógica de negocio, cero cálculos críticos, cero decisiones de acceso.
- **Preparado para crecer:** Diseñar servicios stateless desde el inicio. Cualquier instancia debe poder manejar cualquier request.

### Evitar estrictamente
- Lógica de negocio en componentes de UI o controllers HTTP.
- Dependencias circulares entre módulos.
- God objects / God services (una clase/servicio que hace todo).
- Hardcodear configuración — todo por variables de entorno.

---

## 2. Core Security (OWASP & Perímetro)

### Regla de oro
> **Nunca confiar en el frontend.** Todo dato que llega del cliente es potencialmente malicioso. Validar, sanitizar y autorizar en el servidor, siempre.

### Principios base
- **Mínimo privilegio:** Cada servicio, usuario y proceso solo tiene acceso a lo estrictamente necesario.
- **HTTPS obligatorio** en todos los ambientes (staging y producción). Redirigir HTTP → HTTPS.
- **Secretos protegidos:** Nunca en el código, nunca en logs, nunca en respuestas de API.
- **Defense in depth:** No confiar en una sola capa de seguridad — validar en frontend Y backend.

### OWASP Top 10 — Mitigación obligatoria

| Vulnerabilidad | Mitigación requerida |
|----------------|---------------------|
| **Injection (SQL, NoSQL, Command)** | Queries parametrizadas / ORM. Nunca concatenar inputs en queries. |
| **Broken Access Control** | Verificar permisos en cada endpoint, no solo en el frontend. RBAC implementado en el servidor. |
| **Cryptographic Failures** | HTTPS, hashing con bcrypt/Argon2id, no MD5/SHA1 para passwords. |
| **Security Misconfiguration** | Headers de seguridad, deshabilitar endpoints de debug en producción, no exponer stack traces. |
| **Vulnerable Dependencies** | `npm audit` / `pip audit` en CI. Dependencias con mantenedor activo. |
| **SSRF** | Validar y allowlist URLs externas antes de hacer requests del servidor. Bloquear rangos de IPs privadas (10.x, 172.16.x, 192.168.x, 169.254.x). |
| **Broken Authentication** | Ver sección 3 completa. |
| **XSS** | Sanitizar outputs, CSP configurado, nunca `innerHTML` con data del usuario. |
| **Insecure Direct Object References** | Validar que el usuario autenticado tiene acceso al recurso solicitado por ID. |
| **Security Logging Failures** | Loggear intentos de acceso fallidos, cambios de privilegios y acciones sensibles. |

---

## 3. Autenticación y Sesiones

### Passwords
- **Hashing obligatorio:** `bcrypt` con cost factor ≥ 12, o `Argon2id` (preferido).
- **Prohibido:** MD5, SHA1, SHA256 sin salt para passwords. Passwords en texto plano en cualquier capa.
- **Validación mínima:** longitud ≥ 8 caracteres, verificar contra listas de passwords comunes (HaveIBeenPwned API).

### Tokens y Sesiones
- **Access token:** JWT con expiración corta (≤ 15 minutos).
- **Refresh token:** Rotación en cada uso (Refresh Token Rotation). Invalidar el anterior al emitir uno nuevo.
- **Almacenamiento:** Cookies con `HttpOnly`, `Secure`, `SameSite=Strict` (o `Lax` si necesario). **Nunca localStorage para tokens sensibles.**
- **Logout seguro:** Invalidar refresh token en el servidor. No solo borrar la cookie del cliente.
- **Session fixation:** Regenerar session ID después de autenticación exitosa.
- **Invalidación:** Soporte para revocar todas las sesiones activas de un usuario.

### Brute Force Protection
- Bloqueo progresivo: 5 intentos fallidos → espera de 15 min. 10 intentos → bloqueo de cuenta.
- Rate limiting específico en endpoints de auth: **20 req/min por IP** (más estricto que el general).
- CAPTCHA o proof-of-work tras N intentos fallidos consecutivos.

### MFA
- Arquitectura preparada para TOTP (RFC 6238) y WebAuthn/Passkeys desde el inicio.
- Campo `mfa_enabled` y `mfa_secret` en el modelo de usuario aunque no se implemente en v1.
- **Prohibido:** Confiar roles o permisos enviados desde el frontend.

---

## 4. Frontend Security

### Headers obligatorios
```
Content-Security-Policy: default-src 'self'; script-src 'self'; object-src 'none'
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

### Reglas de código
- **XSS:** Nunca usar `innerHTML`, `dangerouslySetInnerHTML` o `eval()` con data del usuario.
- **Route guards:** Verificar autenticación y permisos en el cliente (UX), pero siempre también en el servidor (seguridad real).
- **Sanitización de outputs:** Escapar HTML en todo contenido generado por usuarios antes de renderizar.
- **Uploads seguros:** Validar tipo MIME en el servidor (no confiar en extensión), límite de tamaño, escanear en cuarentena antes de servir.
- **Dependencias:** No usar librerías con vulnerabilidades conocidas sin patch disponible.

### Prohibido
- `localStorage` o `sessionStorage` para tokens, session IDs o datos sensibles.
- Scripts inline sin nonce en CSP.
- Mostrar errores técnicos o stack traces al usuario.
- Decisiones de autorización solo en el frontend.

---

## 5. Backend & APIs Security

### Validación y Schemas
- Validar schema completo de cada request (body, params, query, headers) con una librería dedicada (Zod, Joi, Pydantic).
- Rechazar requests con campos no esperados (no permitir campos extra silenciosamente).
- Validar content-type: rechazar requests con `Content-Type` incorrecto.
- Límite de payload: **10MB máximo** por defecto, reducir en endpoints que no lo necesiten.

### Rate Limiting
| Contexto | Límite recomendado |
|----------|--------------------|
| General (APIs) | 100 req/min por IP |
| Endpoints de auth | 20 req/min por IP |
| Endpoints sensibles (password reset, etc.) | 5 req/min por IP |
| Uploads | 10 req/min por usuario |

### RBAC y Autorización
- Implementar en el servidor, nunca delegar al frontend.
- Verificar en cada endpoint: ¿está autenticado? ¿tiene el rol? ¿tiene acceso a este recurso específico?
- Principio de mínimo privilegio: roles específicos, no `admin` para todo.

### Manejo de Errores
- Errores centralizados: un solo handler de errores, no try/catch dispersos.
- Logging con contexto (user ID, endpoint, timestamp) pero **sin datos sensibles** (passwords, tokens, PII).
- Respuestas de error genéricas al cliente: nunca exponer stack traces, queries SQL ni rutas internas.
- Códigos HTTP correctos: 401 (no autenticado), 403 (no autorizado), 422 (validación), 429 (rate limit).

### Versionado de API
- Versionar desde el inicio: `/api/v1/...`
- No romper contratos sin deprecation period y versión nueva.

---

## 6. Dependencias y Supply Chain

- **Auditoría en CI:** `npm audit --audit-level=high` / `pip audit` debe pasar antes de cualquier deploy.
- **Lockfiles en git:** `package-lock.json`, `poetry.lock`, `yarn.lock` siempre commiteados.
- **Revisión antes de instalar:** Verificar mantenedor activo, descargas semanales y fecha del último release antes de agregar una dependencia nueva.
- **Dependencias mínimas:** Si se puede hacer con <20 líneas sin librería, no agregar la librería.
- **Updates regulares:** Revisar dependencias desactualizadas cada sprint (`npm outdated`, `pip list --outdated`).

---

## 7. Secrets y CI/CD

- **Nunca en el código:** Ningún secret, API key, password o token en el repositorio. Usar `.env` con `.gitignore` y `.env.example` como referencia.
- **Validación al arrancar:** La app debe fallar con error claro si falta una variable de entorno requerida (usar `dotenv-safe` o equivalente).
- **Secrets en CI:** Usar variables de entorno del sistema CI (GitHub Actions Secrets, etc.), no hardcodear en workflows.
- **Rotación:** Documentar en `SECURITY.md` cuándo y cómo rotar cada tipo de secret.
- **Alcance mínimo:** API keys con solo los permisos necesarios. Nunca usar una key de producción en desarrollo.

```bash
# .env.example — siempre actualizar cuando se agrega un secret nuevo
DATABASE_URL=postgres://user:password@localhost:5432/dbname
JWT_SECRET=your-secret-here-min-32-chars
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d
```

---

## 8. Checklist Pre-deploy Security

Antes de cualquier deploy a producción:

- [ ] `npm audit` / `pip audit` sin vulnerabilidades high/critical
- [ ] Variables de entorno documentadas en `.env.example`
- [ ] Ningún secret en el código (buscar con `git grep -i "api_key\|password\|secret"`)
- [ ] Headers de seguridad configurados y verificados
- [ ] Rate limiting activo en todos los endpoints públicos
- [ ] HTTPS forzado y certificado válido
- [ ] Endpoints de debug/admin deshabilitados o protegidos
- [ ] Logs sin datos sensibles (revisar muestra de logs recientes)
- [ ] RBAC verificado en endpoints nuevos o modificados
- [ ] Stack traces no expuestos en respuestas de error

---

## 9. CMS Rules

### CMS Tradicional (WordPress, Drupal, etc.)

> Las reglas de arquitectura en capas (#1) no aplican — la estructura la controla el CMS.
> Aplicar seguridad via configuración, no código.

**Updates y dependencias**
- Updates automáticos activados: core + plugins de seguridad siempre en última versión.
- Plugins auditados antes de instalar: mantenedor activo, +10k instalaciones activas, último update < 6 meses.
- Auditoría mensual de plugins instalados — desinstalar los que no se usan (superficie de ataque).
- Herramientas: WPScan (WordPress), Drupal Security Advisories.

**Autenticación y acceso admin**
- Usuario admin con nombre no predecible (nunca "admin", "administrator", "root").
- 2FA obligatorio en todas las cuentas con acceso al panel.
- Directorio de admin protegido con IP allowlist o autenticación HTTP adicional.
- Rate limiting en el formulario de login (plugin o configuración de servidor).
- Bloqueo tras 5 intentos fallidos consecutivos.

**Hardening**
- Deshabilitar XML-RPC si no se usa activamente.
- Deshabilitar editor de archivos desde el panel admin (`DISALLOW_FILE_EDIT` en WordPress).
- Ocultar versión del CMS en headers y metadatos.
- Headers de seguridad via `.htaccess` o `nginx.conf` (los mismos del #4).
- Permisos de archivos: directorios `755`, archivos `644`, archivos de configuración `600`.

**Backups**
- Backups automáticos diarios: base de datos + archivos.
- Retención mínima de 30 días.
- Backups almacenados fuera del servidor (S3, otro proveedor).
- Verificar restore funcional al menos una vez al mes.

---

### CMS Headless (Sanity, Contentful, Strapi, etc.)

> Aquí aplican casi todas las reglas del documento. El CMS headless es un **servicio externo
> privilegiado** — tratarlo con las mismas reglas que cualquier integración de terceros.

**API Keys — scope mínimo por contexto**

| Contexto | Permisos | Almacenamiento |
|----------|----------|----------------|
| Frontend (SSG/SSR) | Solo lectura, solo contenido publicado | Variable de entorno del servidor |
| Backend / webhooks | Lectura + escritura según necesidad | Variable de entorno del servidor, nunca cliente |
| Preview (drafts) | Solo lectura, incluye borradores | Variable separada, expiración corta |
| CI/CD (builds) | Solo lectura | Secret del sistema CI |

- **Nunca** usar la misma key para múltiples contextos.
- **Nunca** exponer keys de escritura al frontend.
- Variables de entorno separadas por ambiente: dev, staging y prod usan keys distintas.

**Webhooks**
- Validar firma HMAC de cada webhook antes de procesar el payload.
- Rechazar requests sin firma o con firma inválida con `401`.
- Idempotencia: manejar reenvíos del mismo webhook sin efectos duplicados.
- Timeout de procesamiento: responder `200` rápido, procesar en background.

**Arquitectura de escritura**
- Nunca exponer el endpoint de escritura del CMS directamente al frontend.
- Operaciones de escritura (formularios, UGC) solo a través del propio backend.
- El backend valida, sanitiza y autoriza antes de llamar al CMS.

```
✅ Frontend → Tu Backend → CMS (escritura)
❌ Frontend → CMS (escritura directa)
```

**Strapi (self-hosted) — reglas adicionales**
- Admin panel no expuesto en la misma URL que la API pública.
- Roles y permisos de Strapi revisados — por defecto son permisivos.
- Deshabilitar registro público si no es necesario.
- Actualizar Strapi en cada release de seguridad (historial de CVEs activo).
