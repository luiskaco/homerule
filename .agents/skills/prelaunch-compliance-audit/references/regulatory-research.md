# Investigación normativa — prelaunch-compliance-audit

## Investigación normativa

Hazla para cada país del perfil. Si el país está en la UE, investiga también
la normativa europea que aplica a todos sus miembros.

### Qué buscar: ocho temas

| Tema | Reglas que alimenta | Qué averiguar |
|---|---|---|
| Datos personales | L1, P2, P3, P6 | Ley y autoridad; base legal o consentimiento exigido; derechos y plazo de respuesta; registro de bases de datos; oficial o delegado obligatorio; transferencias internacionales |
| Seguridad e incidentes | S1 a S8 | Medidas de seguridad exigidas; si hay que notificar brechas, a quién y en qué plazo |
| Cookies y rastreo | P1, P7, L4 | Consentimiento previo u opción de rechazo; qué cuenta como esencial |
| Consumidor y comercio electrónico | L2, L3, L5, C1, C2 | Información obligatoria del proveedor; precio total; desistimiento o retracto; canal oficial de reclamos |
| Comunicaciones comerciales | C5 | Consentimiento previo o baja posterior; requisitos del mensaje |
| Publicidad, reseñas y afiliados | C3, C4 | Publicidad engañosa; reseñas y testimonios; revelar patrocinios |
| Menores | P5 | Edad de consentimiento digital; consentimiento parental |
| Accesibilidad | A1 a A3 | Si obliga a privados y desde qué tamaño; estándar exigido; declaración pública |

Investiga solo los temas que el perfil activa: un sitio sin correo promocional
no necesita el tema de comunicaciones comerciales.

### En qué fuentes confiar

| Nivel | Fuente | Uso |
|---|---|---|
| 1 | Diario oficial, portal legislativo, texto consolidado de la norma | Base de un requisito |
| 2 | Regulador o autoridad competente (guías, resoluciones) | Base de un requisito y de cómo se interpreta |
| 3 | Despacho de abogados reconocido, cámara de comercio, con fecha | Pista fiable; confirma en nivel 1 o 2 si puedes |
| 4 | Medios, blogs, vendedores de herramientas de cumplimiento | Solo pista para saber qué buscar; nunca base |

Abre la página que citas: un fragmento de buscador no es una fuente. Los
vendedores de banners de cookies y de widgets de accesibilidad tienden a
exagerar la obligación que su producto resuelve.

### Qué registrar de cada norma

- Nombre, número y artículo.
- Qué exige, aplicado a este proyecto, en una frase.
- Vigencia: fecha de entrada en vigor y reformas o anulaciones conocidas.
- Fuente (URL) y su nivel.
- Confianza: **alta** = texto oficial leído; **media** = regulador o despacho
  coinciden; **baja** = solo fuentes de nivel 4, o fuentes que se contradicen.

Cuando las fuentes se contradicen, no elijas una: registra ambas como "en
disputa", no las uses para subir una regla a Bloqueante y no las afirmes en un
texto legal. Cuando no encuentres norma para un tema, escribe "sin hallazgo":
no encontrar no prueba que no exista.

### Guardar y reutilizar lo investigado

Así dos auditorías del mismo proyecto se pueden comparar y no se paga la
investigación dos veces.

- Ruta: `docs/compliance/{código ISO del país}.md` (por ejemplo `pe.md`,
  `es.md`, y `eu.md` para lo común europeo).
- Proponlo dentro del plan de arreglos; escríbelo solo con aprobación.
- Si el archivo tiene menos de 6 meses: reutilízalo y busca solo reformas
  posteriores a su fecha en cada tema. Actualiza la fecha.
- Si tiene 6 meses o más, o el perfil cambió (ahora cobra, ahora tiene
  menores): reinvestiga los temas afectados.

```markdown
# Normativa: {país} ({código ISO})

**Investigado:** {fecha} · **Revalidar antes de:** {fecha + 6 meses}
**Perfil al investigar:** {tipo, datos, pagos, correo, menores}

| Tema | Norma y artículo | Qué exige a este proyecto | Vigencia | Confianza | Fuente |
|---|---|---|---|---|---|

## En disputa
{Puntos donde las fuentes se contradicen, con ambas fuentes}

## Sin hallazgo
{Temas sin norma encontrada}
```

### Sin búsqueda web

No uses el conocimiento previo del modelo como fuente de una norma: puede
estar desactualizado. La regla "click-to-cancel" de EE. UU. se publicó en 2024
y un tribunal la anuló en 2025; un modelo entrenado entre ambas fechas la
citaría como vigente.

- Audita completas las reglas S, T y G, y la parte comprobable de L, P, C y A
  (si la política existe, si el banner bloquea scripts).
- Si hay caché en `docs/compliance/`, úsala indicando su fecha y que no se
  revalidó.
- Lo que depende de la norma queda ❔ "norma no verificada", con severidad base.
- Pide al usuario los textos o enlaces oficiales de los temas que aplican y
  aplica el protocolo sobre lo que entregue.

## Ejemplos verificados (octubre de 2026)

Un punto de partida, no una fuente. Si el proyecto es de uno de estos
territorios, trátalos como una caché fechada en octubre de 2026: revalida
antes de usarlos.

### Perú

| Tema | Norma | Qué exige |
|---|---|---|
| Datos personales | Ley 29733 y Reglamento DS 016-2024-JUS (vigente desde marzo de 2025) | Consentimiento previo, informado, expreso e inequívoco; derechos de acceso, rectificación, cancelación, oposición y portabilidad; Oficial de Datos Personales con designación escalonada; aplica también desde fuera del país |
| Seguridad e incidentes | Mismo Reglamento | Medidas de seguridad documentadas; aviso de incidentes a la autoridad en 48 horas |
| Menores | Reglamento, art. 22 | Consentimiento de padres o tutores; de 14 a 17 años pueden consentir si la información es comprensible para su edad |
| Publicidad con datos | Reglamento, art. 26 | Consentimiento propio para publicidad y prospección |
| Correo comercial | Ley 28493 | "PUBLICIDAD" en el asunto; nombre, domicilio y correo del remitente; mecanismo de baja |
| Consumidor | Ley 29571 | Precio total con tributos y cargos; reclamos respondidos en 15 días hábiles |
| Libro de Reclamaciones | Ley 29571, arts. 150-151, modificados por Ley 32495 (nov. 2025) | Enlace permanente y visible con el aviso oficial. Indecopi lo ha exigido también a webs solo informativas. Herramienta gratuita: "Tu Libro de Reclamaciones" |
| Engaño y testimonios | DL 1044 | Sanciona publicidad engañosa y testimonios no auténticos |
| Accesibilidad | Ley 28530, art. 3 | Alcanza a privados que prestan servicios al consumidor por web; poco fiscalizada |
| En disputa | Retracto en compras en línea | Hay resúmenes que atribuyen 7 días a la Ley 32495; su texto solo trata del Libro de Reclamaciones |

### Unión Europea y España

| Tema | Norma | Qué exige |
|---|---|---|
| Datos personales | RGPD; España: LOPDGDD | Base legal por finalidad; información de arts. 13-14; derechos en un mes; contrato con cada encargado; garantías para transferencias |
| Seguridad e incidentes | RGPD, arts. 32-33 | Medidas apropiadas al riesgo; brechas notificadas en 72 horas |
| Menores | RGPD, art. 8 | 16 años por defecto; España: 14 |
| Cookies | ePrivacy; España: LSSI art. 22.2 y guía AEPD | Consentimiento previo para lo no esencial; rechazar tan fácil como aceptar |
| Aviso legal | LSSI, art. 10 | Denominación, domicilio, correo, datos registrales, identificación fiscal |
| Consumidor | Directiva 2011/83/UE | Desistimiento de 14 días en venta a distancia, con excepciones; precio total |
| Reseñas y precios | Directiva (UE) 2019/2161 | Explicar cómo se verifican las reseñas; en rebajas, precio más bajo de los 30 días previos |
| Correo comercial | LSSI, art. 21 | Consentimiento previo salvo clientes y productos similares |
| Accesibilidad | Directiva (UE) 2019/882 (desde jun. 2025) | E-commerce y servicios al consumidor: EN 301 549 (WCAG 2.1 AA); microempresas de servicios exentas; declaración de accesibilidad |

### Estados Unidos

| Tema | Norma | Qué exige |
|---|---|---|
| Privacidad | Leyes estatales (California y otras) | Política de privacidad; sobre ciertos umbrales, derechos de acceso y borrado, enlace "Do Not Sell or Share" y señal Global Privacy Control |
| Seguridad e incidentes | Leyes estatales de notificación de brechas | Avisar a los afectados; plazo y contenido varían por estado |
| Engaño | FTC Act, sección 5 | Prohíbe prácticas desleales o engañosas (C1, C2, C4) |
| Reseñas y afiliados | Regla de la FTC sobre reseñas (oct. 2024); guías de endosos | Prohíbe reseñas falsas o compradas; revelar toda relación material |
| Correo comercial | CAN-SPAM | Asunto veraz, dirección postal física, baja atendida en 10 días hábiles |
| Suscripciones | ROSCA y leyes estatales | Términos claros, consentimiento expreso, cancelación simple. "Click-to-cancel" (2024) fue anulada en julio de 2025 y no está vigente |
| Menores | COPPA (reforma exigible desde abril de 2026) | Menores de 13: consentimiento parental verificable y política escrita de retención |
| Accesibilidad | ADA, Título III | Los tribunales la aplican a webs con WCAG 2.1 AA como referencia |
