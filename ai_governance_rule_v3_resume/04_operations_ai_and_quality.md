# Operations, AI Security & Quality Rules

## 1. AI Security (Sistemas de Inteligencia Artificial)
- **Mitigación:** Prompt injection mitigation, aislamiento de contexto, protección de secretos, validación estricta de tool calls y aislamiento de datos por usuario.
- **Gobernanza de IA:** Trazabilidad completa, límites operacionales, validación rigurosa de outputs y prevención de abuso.

## 2. Cloud, CI/CD y Resiliencia
- **Cloud/Infraestructura:** IAM correcto, buckets protegidos, servicios aislados y principio de mínimo privilegio.
- **CI/CD:** Proteger secrets, escaneo automático de dependencias, builds seguros y evitar a toda costa logs con información sensible.
- **Resiliencia:** Diseñar con tolerancia a errores, degradación controlada, planes de backup, rollback automatizado y evitar Single Points of Failure (SPOF).

## 3. Observabilidad y Auditoría
- **Debe incluir:** Logging estructurado (JSON), request tracing, monitoreo básico, audit logs y tracking de fallos de autenticación (auth failures).

## 4. Control de Calidad (Testing & Entrega)
- **Validaciones Técnicas:** Builds exitosos, consola limpia de errores/warnings e imports válidos.
- **Funcionales & UI:** Probar edge cases, flujos de autenticación, uploads, formularios, diseño responsive y estados de carga.
- **Seguridad:** Re-verificar validaciones backend, permisos y sanitización.
- **REGLA FINAL DE COMPILACIÓN:** Está estrictamente prohibido considerar terminada una tarea solo porque el código compile. Debe probarse la lógica del flujo completo.