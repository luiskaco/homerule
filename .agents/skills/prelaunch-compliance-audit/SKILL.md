---
name: prelaunch-compliance-audit
description: Audita una web o app antes de lanzarla (o ya publicada) contra 43 reglas legales, de privacidad, seguridad, accesibilidad, técnicas y de SEO; investiga la normativa vigente del país del proyecto, sea cual sea, y propone arreglos para que el usuario los apruebe. Úsala cuando pidan auditar, revisar o preparar un sitio para producción, revisar su seguridad, un checklist de lanzamiento, cumplimiento legal en cualquier país, o redactar privacidad, términos, reembolsos, cookies o aviso legal.
---

# Prelaunch Compliance Audit

Audita un proyecto web o una app contra un catálogo universal de 43 reglas,
investiga qué normas del país del proyecto hay detrás de cada una y propone
arreglos concretos. No modifica nada hasta que el usuario aprueba.

## Qué es y qué no es

Esta skill reduce riesgo; no lo elimina. Detecta ausencias y contradicciones
(falta la política, el pixel carga antes del consentimiento, una clave de API
viaja en el bundle) y redacta los textos legales a partir de hechos reales del
proyecto. No certifica cumplimiento, no sustituye a un abogado ni a una prueba
de penetración, y hay reglas que ninguna inspección puede cerrar (licencias de
imágenes, reseñas, veracidad de lo que se promete).

Por eso el veredicto nunca es "cumple la ley" ni "es seguro". Es "N
bloqueantes, N pendientes de confirmación humana". Decir más sería justo el
tipo de afirmación engañosa que la regla C4 manda quitar.

## Por qué el catálogo es universal y la normativa no

Las 43 reglas son temas que existen en cualquier país: informar qué datos se
recogen, no esconder cargos, dejar darse de baja, proteger las contraseñas. Lo
que cambia por país es la norma detrás de cada tema, su exigencia y su plazo.
Por eso la skill no trae leyes como verdad: trae un protocolo para
investigarlas, con fuentes jerarquizadas, nivel de confianza y fecha. Los
países que aparecen al final son ejemplos ya verificados, no la fuente.

## Alcance

Si el usuario no elige, usa `completo`.

| Modo | Reglas | Cuándo |
|---|---|---|
| `legal` | L, P, C, A + investigación normativa | Antes de captar datos o cobrar |
| `seguridad` | S, T1 | Antes de abrir login, pagos o datos de usuarios |
| `tecnico` | T, G | QA de lanzamiento, SEO, rendimiento |
| `completo` | Todas | Por defecto |

## Flujo

1. **Perfilar** el proyecto.
2. **Investigar la normativa** de cada país que aplique (si el modo incluye `legal`).
3. **Inspeccionar** código o sitio en vivo.
4. **Evaluar** cada regla que aplique.
5. **Reportar** con la plantilla fija.
6. **Proponer** arreglos y esperar aprobación.
7. **Aplicar** solo lo aprobado y volver a verificar esas reglas.

### 1. Perfilar

La mitad de las reglas son condicionales: una landing informativa no necesita
política de reembolso y un sitio sin login no tiene sesiones que proteger. Sin
perfil, la auditoría produce ruido o deja pasar lo importante.

Infiere todo lo que puedas del código o del sitio y pregunta solo lo que falte,
en una sola ronda:

- **Países**: dónde está constituido el titular y dónde están los usuarios.
  Pueden ser varios; la ley de consumo y de datos sigue al usuario, no al
  servidor. Nunca los asumas por el idioma del sitio.
- **Tipo**: informativo, captación de leads, e-commerce, SaaS, app móvil,
  marketplace, contenido con afiliados.
- **Datos personales**: formularios, cuentas, pagos, tracking. ¿Hay datos
  sensibles (salud, biométricos, financieros)?
- **Dinero**: ¿se cobra en línea?, ¿hay suscripción o renovación automática?
- **Comunicaciones**: ¿envía correo, SMS o WhatsApp promocional?
- **Menores**: ¿está dirigido a menores o es probable que lo usen?
- **Acceso**: ¿hay login, roles o panel de administración?
- **Negocio local**: ¿atiende en un local físico o zona concreta?
- **Datos del titular**: razón social, identificación fiscal, domicilio,
  contacto. Hacen falta para L5 y para cualquier texto legal.

### 2. Investigar la normativa

Ver `references/regulatory-research.md`. Hazlo antes de evaluar: la
severidad de muchas reglas depende de lo que encuentres.

### 3. Inspeccionar

Trabaja sobre lo que haya, sin depender de ningún framework:

- **Con código fuente**: busca por señales, no por rutas fijas. Plantillas,
  formularios y sus campos, esquema de base de datos, manifiestos de
  dependencias, scripts externos, variables de entorno, plantillas de correo,
  rutas y middleware de autenticación, configuración de servidor, contenedores
  y hosting.
- **Solo con URL**: descarga páginas clave (inicio, contacto, registro,
  checkout, pie), cabeceras HTTP, `robots.txt`, `sitemap.xml` y una URL
  inexistente para ver el 404. Si hay navegador, mira qué peticiones salen
  *antes* de aceptar cookies.

**Seguridad: verificación pasiva y solo sobre el proyecto del usuario.** Lee
código y configuración, pide cabeceras, ejecuta el auditor de dependencias del
propio gestor de paquetes. No lances escáneres agresivos, fuerza bruta ni
pruebas de explotación contra sitios en vivo: pueden tumbar el servicio y,
sobre un sistema ajeno o un hosting compartido, son acceso no autorizado. Si
una regla solo se confirmaría explotándola, queda ⚠️.

Declara en el reporte qué modo usaste y qué quedó fuera. Lo que no pudiste
comprobar va en "No se pudo verificar", nunca en "Cumple": un falso verde es
peor que un hueco reconocido, porque el usuario deja de mirar ahí.

### 4. Evaluar

Cada regla termina en exactamente un estado:

| Estado | Significado |
|---|---|
| ✅ Cumple | Comprobado, con evidencia |
| ❌ Falla | Comprobado que falta o está mal, con evidencia |
| ⚠️ Confirmación humana | Solo el usuario puede responderlo |
| ➖ No aplica | El perfil la excluye (indica por qué) |
| ❔ No verificado | Aplica, pero la inspección o la norma no se pudo confirmar |

Y cada fallo, una severidad:

- **Bloqueante**: exposición legal directa, vulnerabilidad explotable o algo
  roto que impide usar el sitio.
- **Importante**: riesgo real o daño claro a usuarios, sin ser urgente.
- **Recomendado**: buena práctica; no hacerlo no incumple nada.

La severidad base está en el catálogo (`references/rule-catalog.md`). Una norma de confianza alta o media
que exige algo de forma expresa sube esa regla a Bloqueante; una de confianza
baja no sube nada. Toda evidencia cita `archivo:línea` o la URL exacta. Sin
evidencia no hay hallazgo.

## Referencias

Cargar cada archivo solo cuando el paso lo necesita:

| Archivo | Contenido | Cuándo |
|---|---|---|
| `references/rule-catalog.md` | Las 43 reglas (L, P, C, A, S, T, G) y cómo resolver las que chocan | Pasos 3 y 4 |
| `references/regulatory-research.md` | Protocolo de investigación normativa, caché en `docs/compliance/` y ejemplos verificados por país | Paso 2 |
| `references/legal-texts.md` | Cómo redactar privacidad, términos, reembolsos, cookies y aviso legal | Al redactar textos legales |

## Formato del reporte

Usa siempre esta estructura. Entrega el reporte en la conversación; guárdalo
como archivo solo si el usuario lo pide y en la ruta que indique.

```markdown
# Auditoría prelanzamiento: {proyecto}

**Fecha:** {fecha} · **Alcance:** {modo} · **Inspección:** {código | URL}
**Países:** {lista} · **Perfil:** {tipo, datos, pagos, correo, menores, acceso}
**Normativa:** {por país: investigada hoy | caché del {fecha} revalidada | no verificada}

## Resumen

{N} bloqueantes · {N} importantes · {N} recomendados ·
{N} pendientes de confirmación humana · {N} sin verificar

| Categoría | ✅ | ❌ | ⚠️ | ➖ | ❔ |
|---|---|---|---|---|---|

## Normativa aplicada

| País | Tema | Norma | Confianza | Fuente |
|---|---|---|---|---|

## Bloqueantes

### {ID} {Regla}
- **Evidencia:** {archivo:línea o URL, y qué se ve ahí}
- **Por qué importa:** {consecuencia para el usuario, o norma y país}
- **Arreglo propuesto:** {cambio concreto}
- **Esfuerzo:** {S | M | L}

## Importantes
## Recomendados

## Requiere confirmación humana
{Preguntas o tareas concretas, una por regla}

## No aplica
{Una línea por regla con el motivo}

## No se pudo verificar
{Qué quedó fuera de esta inspección o investigación y cómo cerrarlo}

## Plan de arreglos
{Lista numerada, agrupada por tipo de cambio, esperando aprobación}
```

Reglas del reporte:

- Ordena por severidad, no por ID: lo primero que se lee es lo que más pesa.
- Una regla ⚠️ se redacta como pregunta o tarea accionable ("¿De dónde salen
  los 3 testimonios de la home? Necesito la fuente de cada uno"), no como
  recordatorio genérico.
- Un hallazgo de seguridad describe el riesgo y el arreglo, nunca una receta
  para explotarlo.
- No rellenes. Si una categoría no tiene fallos, una línea basta.

## Proponer y aplicar arreglos

El usuario decide qué se cambia. Después del reporte, presenta el plan y
detente. No edites archivos, no instales paquetes y no cambies configuración
hasta que apruebe, por ítem o por grupo.

- Agrupa por tipo de cambio para que aprobar sea rápido: seguridad, textos
  legales, consentimiento y cookies, accesibilidad, técnica.
- Para cada arreglo indica qué archivos toca y qué puede romper.
- Un secreto expuesto (S2) no se arregla solo borrándolo: hay que rotarlo,
  porque ya pudo copiarse. Dilo en el arreglo.
- Arreglos que alteran el negocio (quitar un campo, eliminar un testimonio,
  cambiar cómo se muestra el precio) se proponen aparte, nunca dentro de un
  lote técnico.
- Tras aplicar, vuelve a evaluar solo las reglas tocadas y muestra el antes y
  el después.
- Si el proyecto tiene `docs/06_TASKS.md`, ofrece registrar ahí los arreglos
  aprobados antes de tocar código. Si se descarta un bloqueante a sabiendas,
  ofrece dejar constancia en `docs/07_DECISIONS.md`, y los cambios aplicados
  en `docs/08_CHANGELOG.md`.
