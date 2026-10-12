# Catálogo de reglas — prelaunch-compliance-audit

## Catálogo de reglas

Tipo: **Auto** = verificable inspeccionando; **Humano** = requiere al usuario;
**Mixto** = se detecta el indicio, el usuario confirma.

### L. Documentos legales

| ID | Regla | Aplica si | Cómo verificar | Tipo | Base |
|---|---|---|---|---|---|
| L1 | Política de privacidad | Trata cualquier dato personal (incluye analítica e IP) | Existe, enlazada en pie y junto a cada formulario, y describe lo que el código hace de verdad (cruza con P3 y P4) | Mixto | Bloqueante |
| L2 | Términos del servicio | Hay cuentas, pagos o contenido de usuarios | Existe, enlazada, y se acepta antes de crear cuenta o pagar | Mixto | Importante |
| L3 | Política de reembolso y devoluciones | Cobra en línea | Existe, enlazada antes del pago; plazos y condiciones concretos | Mixto | Bloqueante |
| L4 | Política de cookies | Usa cookies o almacenamiento no esencial | Lista cada cookie real (nombre, proveedor, fin, duración) y coincide con lo detectado | Auto | Importante |
| L5 | Identificación del titular (aviso legal) | Siempre | Razón social, identificación fiscal, domicilio y contacto visibles sin registrarse | Auto | Importante |

### P. Privacidad y datos

| ID | Regla | Aplica si | Cómo verificar | Tipo | Base |
|---|---|---|---|---|---|
| P1 | Banner de consentimiento de cookies | Hay cookies o scripts no esenciales | Rechazar es tan fácil como aceptar; nada premarcado; se puede cambiar después | Auto | Importante |
| P2 | Consentimientos verificables | Recoge datos por formulario | Casilla sin premarcar, fin explícito, consentimientos separados (servicio vs. publicidad), y queda registro de fecha y versión del texto | Auto | Bloqueante |
| P3 | Sin datos innecesarios | Recoge datos | Para cada campo de formulario y columna de BD: ¿qué función lo usa? Si ninguna, sobra | Mixto | Importante |
| P4 | Auditar SDKs y scripts de terceros | Carga código o recursos externos | Inventario de dominios externos y paquetes: qué dato recibe cada uno, dónde lo aloja, si figura en L1 y si espera al consentimiento | Auto | Importante |
| P5 | Consentimiento para menores | Dirigido a menores o uso probable por ellos | Control de edad y vía de consentimiento parental según la edad que fije la norma | Mixto | Bloqueante |
| P6 | Solicitud de eliminación y demás derechos | Trata datos personales | Hay canal visible para pedir acceso, corrección y borrado, y el borrado funciona de verdad (incluye copias y terceros) | Mixto | Bloqueante |
| P7 | Analítica instalada y condicionada | Siempre | Hay medición y, donde la norma exige consentimiento, no dispara antes de obtenerlo | Auto | Recomendado |

### C. Honestidad comercial

| ID | Regla | Aplica si | Cómo verificar | Tipo | Base |
|---|---|---|---|---|---|
| C1 | Sin patrones oscuros | Hay registro, pago o suscripción | Sin urgencia o escasez falsas, sin opciones premarcadas que cuestan dinero, sin "confirmshaming", y cancelar no es más difícil que contratar | Mixto | Importante |
| C2 | Sin tarifas ocultas | Cobra en línea | El precio mostrado al inicio incluye impuestos y cargos obligatorios; el total no sube en el último paso | Mixto | Bloqueante |
| C3 | Sin reseñas falsas | Muestra reseñas, testimonios o valoraciones | Señala testimonios sin fuente, valoraciones fijas en el código y esquemas de rating sin reseñas reales | Humano | Bloqueante |
| C4 | Sin afirmaciones engañosas | Siempre | Lista afirmaciones comprobables ("el n.º 1", "garantizado", cifras, sellos, "100% seguro") y pide el respaldo de cada una | Humano | Importante |
| C5 | Baja en correos comerciales | Envía correo promocional | Cada plantilla promocional tiene enlace de baja que funciona sin iniciar sesión, e identifica al remitente | Auto | Bloqueante |
| C6 | Imágenes, fuentes e íconos con licencia | Usa recursos de terceros | Lista los recursos que no son propios y pide el origen y la licencia de cada uno | Humano | Importante |

### A. Accesibilidad

Referencia: WCAG 2.1 nivel AA. Las herramientas automáticas detectan solo una
parte de los problemas; di qué comprobaciones fueron automáticas.

| ID | Regla | Aplica si | Cómo verificar | Tipo | Base |
|---|---|---|---|---|---|
| A1 | Texto alternativo | Hay imágenes | Toda imagen informativa tiene `alt` que describe su función; las decorativas, `alt=""` | Auto | Importante |
| A2 | Contraste de color | Siempre | 4.5:1 en texto normal, 3:1 en texto grande y componentes; calcula sobre los colores reales | Auto | Importante |
| A3 | Navegación por teclado | Siempre | Todo lo interactivo es alcanzable y operable con teclado, foco visible, orden lógico, sin trampas de foco en modales | Mixto | Importante |

### S. Seguridad técnica

No varía por país; lo que varía es el plazo y el destinatario de la
notificación de una brecha (S8), que sale de la investigación normativa.

| ID | Regla | Aplica si | Cómo verificar | Tipo | Base |
|---|---|---|---|---|---|
| S1 | Cabeceras de seguridad | Siempre | CSP sin `unsafe-inline` innecesario, `X-Content-Type-Options: nosniff`, protección contra iframes (`frame-ancestors` o `X-Frame-Options`), `Referrer-Policy`, `Permissions-Policy` | Auto | Importante |
| S2 | Sin secretos expuestos | Siempre | Claves y tokens fuera del repositorio y del bundle del cliente; `.env`, `.git`, copias y source maps no accesibles por URL; en el cliente solo claves públicas por diseño | Auto | Bloqueante |
| S3 | Dependencias sin vulnerabilidades conocidas | Siempre | Auditor del gestor de paquetes del proyecto; CMS, plugins, runtime e imágenes de contenedor con soporte vigente | Auto | Importante |
| S4 | Autenticación y sesiones | Hay login | Contraseñas con hash lento (bcrypt, argon2, scrypt); límite de intentos; cookies de sesión `Secure`, `HttpOnly` y `SameSite`; token de restablecimiento de un solo uso que caduca; MFA en cuentas de administración | Mixto | Bloqueante |
| S5 | Control de acceso | Hay datos por usuario o panel admin | Cada endpoint comprueba en servidor que el recurso pertenece a quien lo pide; rutas de administración protegidas; nada depende de que una URL sea difícil de adivinar | Mixto | Bloqueante |
| S6 | Validación de entradas | Recibe datos del usuario | Consultas parametrizadas; salida escapada contra XSS; subidas con tipo, tamaño y destino controlados; validación en servidor, no solo en el navegador | Auto | Bloqueante |
| S7 | Sin exposición de información | Siempre | Modo debug apagado; errores sin trazas; sin listado de directorios; versión del servidor oculta; bases de datos y paneles internos no accesibles desde internet; CORS limitado a orígenes conocidos | Mixto | Importante |
| S8 | Copias de seguridad y respuesta a incidentes | Trata datos o tiene contenido propio | Copias automáticas fuera del servidor con restauración probada; registros de acceso; plan escrito de quién actúa ante una brecha y a quién se notifica en qué plazo | Humano | Importante |

S3 sube a Bloqueante si hay una vulnerabilidad crítica explotable sin
autenticación.

### T. Técnica y SEO

| ID | Regla | Cómo verificar | Tipo | Base |
|---|---|---|---|---|
| T1 | Forzar HTTPS | HTTP redirige a HTTPS, sin contenido mixto, HSTS presente | Auto | Bloqueante |
| T2 | Meta títulos y descripciones | Únicos por página, con longitud razonable | Auto | Recomendado |
| T3 | Datos estructurados | JSON-LD válido y coherente con lo visible en la página | Auto | Recomendado |
| T4 | Sitemap y robots.txt | Existen, el sitemap está referenciado y robots no bloquea producción por error | Auto | Importante |
| T5 | Favicon | Presente en los tamaños habituales | Auto | Recomendado |
| T6 | Imágenes comprimidas | Formatos modernos, dimensiones acordes al uso, carga diferida bajo el pliegue | Auto | Recomendado |
| T7 | Velocidad de carga | Core Web Vitals en verde; mide, no estimes | Auto | Importante |
| T8 | Se ve bien en móvil | `viewport` correcto, sin scroll horizontal, objetivos táctiles amplios | Mixto | Importante |
| T9 | Página 404 personalizada | Una URL inexistente devuelve estado 404 real y una página útil | Auto | Recomendado |
| T10 | Enlaces rotos | Rastrea enlaces internos y externos | Auto | Importante |
| T11 | Formularios protegidos contra spam | Hay defensa en servidor (honeypot, límite de frecuencia, validación) | Auto | Importante |

### G. Captación (opcionales)

Son tácticas de conversión, no requisitos. Nunca producen un ❌: como mucho,
una sugerencia.

| ID | Regla | Aplica si | Nota |
|---|---|---|---|
| G1 | Ficha de Google | Negocio local | Externa al código: confirmación humana |
| G2 | Botón de WhatsApp | El negocio atiende por WhatsApp | Si se añade, declarar en L1 que el contacto pasa por Meta |
| G3 | Una llamada a la acción principal | Páginas de captación | Una acción *principal* por página, no un único botón en todo el sitio |

## Reglas que chocan

Aplicar el catálogo como una lista de casillas produce contradicciones.
Resuélvelas así y explica la decisión en el reporte:

- **P7 contra P1/P2**: "analítica instalada" no significa "disparada al cargar".
  Donde se exige consentimiento previo, la analítica espera. Alternativa:
  medición sin cookies ni identificadores personales.
- **T11 contra P4 y A3**: un CAPTCHA de terceros es otro SDK que recibe datos
  y a menudo una barrera de accesibilidad. Prefiere honeypot, límite de
  frecuencia y validación en servidor.
- **T7 contra P4**: cada script externo cuesta rendimiento, privacidad y
  superficie de ataque. Si nadie mira los datos de una herramienta, quitarla
  arregla tres reglas.
- **S1 contra P4 y G2**: una CSP estricta bloquea terceros legítimos. Añadir o
  quitar un proveedor exige actualizar la CSP y la política de privacidad a la
  vez.
- **S7 contra T9**: la página 404 y las de error no deben revelar rutas,
  versiones ni trazas.
- **C5 solo aplica a correo promocional**: los transaccionales (recibo,
  restablecer contraseña) no llevan enlace de baja.
- **L1 debe decir la verdad sobre P3 y P4**: una política que describe
  prácticas que el código no cumple es peor que no tenerla, porque convierte
  un descuido en una declaración falsa. Audita P3 y P4 antes de juzgar L1.
- **G3 contra L y P**: simplificar la página no justifica esconder enlaces
  legales ni el aviso de cookies.
