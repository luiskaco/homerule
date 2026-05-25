# Architecture & Security Rules

## 1. Arquitectura y Escalabilidad
- **Principios:** Separación de responsabilidades, modularidad, desacoplamiento y servicios reutilizables.
- **Evitar:** Lógica mezclada, dependencias innecesarias y frontend con lógica pesada. Diseñar preparado para el crecimiento futuro.

## 2. Core Security (OWASP & Perímetro)
- **Regla de oro:** Nunca confiar en el frontend; validar todo estrictamente en el backend. Mínimo privilegio, HTTPS obligatorio y protección de secretos.
- **OWASP Top 10:** Mitigar proactivamente Injection, Broken Access Control, SSRF, Security Misconfiguration y Vulnerable Dependencies.

## 3. Autenticación y Sesiones
- **Requisitos:** Hashing seguro, Refresh Token Rotation, expiración de sesiones, MFA-ready, logout seguro y protección brute-force.
- **Sesiones:** Cookies HttpOnly, Secure, SameSite, invalidación de sesiones y protección session fixation.
- **Prohibido:** Passwords en texto plano, tokens inseguros y confiar roles al frontend.

## 4. Frontend & Backend Security
- **Frontend:** Implementar CSP, HSTS, X-Frame-Options, prevención XSS, route guards, sanitización y uploads seguros. PROHIBIDO usar localStorage para tokens sensibles, scripts o HTML inseguros.
- **Backend & APIs:** Validación de schemas, RBAC, rate limiting, auth middleware, manejo centralizado de errores y prevención de SQL Injection. Límites de payload, validación de content-types, versionado y protección de endpoints sensibles.