# Bitácora de cambios

Registro de cambios relevantes del proyecto **AI Rules Hub / makeRuleIA**, tanto en las reglas/skills como en el sitio (`site/`). Formato inspirado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/), adaptado a un proyecto sin versionado semántico: los cambios se agrupan por fecha.

## [Sin publicar]

### Cambios

- **Regla de largo en § 0** (regla de escritura 7): lo más corto que se entienda — una pregunta simple en 1–3 frases, sin repetir lo que dijo el usuario, sin resumir paso a paso lo hecho ni cerrar con ofrecimientos genéricos. Al sacar caveman las respuestas se alargaron y el texto que escribe la IA es lo más caro por token.
- **SEO solo donde corresponde.** La regla `seo` aclara que aplica solo a sitios públicos: en paneles y herramientas internas lo único que corresponde es que no se indexen. `ui-reviewer` revisa SEO on-page solo si la regla `seo` está instalada (antes la revisaba siempre, "con criterio general" si faltaba), y lo mismo con `pwa`. Una IA se confundió proponiendo SEO en un proyecto interno que tenía la regla instalada por el preset.
- **Regla `seo`: archivos en la raíz del sitio.** Qué debe tener `robots.txt` (con la línea del sitemap, sin bloquear CSS/JS, staging bloqueado y con `noindex`), cómo debe ser `sitemap.xml`, `llms.txt` como opcional apoyado en la skill `ai-seo`, y en WordPress usar lo que ya genera WordPress o el plugin de SEO en vez de archivos a mano. La descripción suma `robots.txt` y `llms.txt` para que la regla se active con esos temas. **Regla `security`:** publicar `/.well-known/security.txt` (RFC 9116) con `Contact` y `Expires`.
- **Fuera el bloque de `codebase-memory-mcp` de `CORE.md` y `GEMINI.md`** del repo. El generador ya lo quitaba de los kits, pero acá se cargaba en cada turno y empujaba a la IA a usar el grafo aunque el proyecto no estuviera indexado. El MCP sigue instalado para usarlo a pedido; también se quitaron sus hooks y recordatorios de la configuración global del autor.
- **Reglas de uso de subagentes en § 8** (ADR-030): cambios chicos sin subagente, uno por tarea grande y reanudarlo, instrucciones exactas a quien implementa y el alcance completo a quien revisa, revisiones una vez al final (con auditoría de seguridad siempre que toque login, pagos o datos sensibles), build/tests/lint con comandos e informes breves. Cada invocación arranca sin contexto: evitar las que sobran es el mayor ahorro que quedaba.
- **Fuera del repo las 8 skills de diseño duplicadas** (`hallmark`, `emil-design-eng`, `apple-design`, las 4 de animación y `pick-ui-library`): eran idénticas a las que el autor tiene en su cuenta de Claude y en cada sesión de este proyecto aparecían dos veces. Siguen disponibles desde la cuenta; el README explica cómo instalarlas en otra máquina. `skills-lock.json` queda solo con `api-security-best-practices`. No cambia nada del kit ni del sitio.
- **Criterio propio en § 0** (ADR-029): la IA evalúa lo que se le pide antes de ejecutarlo y avisa primero si ve un problema o una opción mejor; separa lo que sabe de lo que supone, se corrige si se contradijo, no inventa desacuerdo y, si el usuario insiste, lo hace a su manera. Fix: la fila de `/tools-reference` en § 7 había quedado con un resto de la fila de `/caveman` (ADR-028) y se colaba en los ZIP.
- **Se elimina el modo caveman y § 0 pasa a "Cómo Responder"** (ADR-028), en `CORE.md` y `GEMINI.md`. Los agentes lo leían como "comprimí todo" y respondían denso y robótico. En su lugar, un tono de colega a colega y seis reglas: primero la respuesta en lenguaje simple, nada de nombres internos sin explicar, una idea por párrafo, como mucho 2–3 opciones con una recomendada, comandos en bloque aparte y una sola pregunta fácil de contestar. Sale también `/caveman` de § 7. El formato de cierre no cambia.
- **Menos subagents en Claude Code y menos tokens por turno** (ADR-027). Pasan de 11 a 8 por defecto (10 con los de servidores).
  - **Salen tres que duplicaban algo existente:** `explorer` (lo cubre el agente `Explore` de Claude Code), `docs-writer` (lo cubre `/session-close`) y `deploy-checker` (sus chequeos pasan a `/deploy-checklist`, que suma git, variables de entorno usadas vs. documentadas, migraciones y veredicto GO / NO-GO).
  - **Los comandos delegan en su agente:** `/bug-fix` en `debugger`, `/security-audit` en `security-auditor` (`security` en Antigravity) y `/deploy-checklist` manda las migraciones a `db-migration-reviewer`.
  - **Descripciones de 1–2 líneas** con cuándo usar cada agente y cuándo no. Claude Code las carga en todos los turnos: el listado baja de ~1.200 a ~500 tokens.
  - **Opus solo en `planner`, `security-auditor`, `db-migration-reviewer` y `server-operator`,** donde un error cuesta caro; el resto en sonnet. Todos tienen `maxTurns`.
  - Quien tenga el kit instalado tiene que borrar `explorer.md`, `docs-writer.md` y `deploy-checker.md` de `.claude/agents/`: el ZIP nuevo no los trae, pero no borra lo que ya está.
- **Agentes de servidores: `server-inspector` y `server-operator`** (ADR-026), en Claude Code (de 11 a 13) y Antigravity (de 5 a 7). Se conectan solo por alias de `~/.ssh/config`, nunca por `user@host` ni por IP, con una lista de alias por proyecto en `.claude/ssh-hosts.txt` o `.agents/ssh-hosts.txt`.
  - **`server-inspector` diagnostica sin cambiar nada:** logs, servicios, disco, procesos, puertos y contenedores.
  - **`server-operator` aplica cambios de a uno,** cada uno con la aprobación del usuario.
  - **En Claude Code, un hook nuevo (`.claude/hooks/ssh-guard.mjs`) revisa cada comando.** Al inspector solo le deja pasar lecturas. Al operator le hace pedir aprobación en cada `ssh`, `scp` o `rsync`, y no lo deja correr en `bypassPermissions` ni en `dontAsk`. A los dos les bloquea:
    - los túneles y saltos a otros hosts;
    - leer secretos (`.env`, claves, variables de entorno);
    - lo que no termina, como `tail -f`;
    - lo que deja sin acceso al servidor, aunque se apruebe: reboot, firewall, `sshd_config`, usuarios, formateo, `rm -rf` sobre `/`.
  - **En Antigravity no hay hooks:** corren con `commandExecutionPolicy: off` y las reglas van en el prompt.
  - **Solo por ZIP y fuera de los presets:** sin el hook, el plugin no garantizaría la aprobación por cambio.
  - **El parser de `readonly-bash` pasa a `shell-parse.mjs`,** compartido por los dos hooks. El generador empaqueta cada hook con lo que importa.
  - **Pruebas en vivo:** pasan las 5 de Claude Code y ADR-026 queda Aceptada para ese tool. El pedido de aprobación del hook aparece aun con `ssh` en la allow list y en todos los modos, y el bloqueo con exit 2 se respeta incluso en `bypassPermissions` y `dontAsk`, también para `readonly-bash` y `web-guard`. En Antigravity no se pudieron medir: el agente principal corrió los `ssh` él mismo, sin delegar y sin pedir aprobación. El INSTALL del ZIP marca esos dos agentes como sin verificar.
- **Dos subagents nuevos en Claude Code** (tanda 2, de 9 a 11). `db-migration-reviewer` revisa migraciones antes de aplicarlas: pérdida de datos, vuelta atrás, locks en tablas grandes, compatibilidad con el código que sigue desplegado durante el deploy, backfills, índices y RLS; devuelve `Aplicar` / `Aplicar con cambios` / `No aplicar` y marca "a verificar" lo que depende de la base real. Corre en opus con `effort: high`. `deploy-checker` recorre `/deploy-checklist` contra el estado real del repo (git, secrets, `npm audit`, variables de entorno usadas vs. documentadas, migraciones, headers, docs y rollback) y devuelve `GO` / `GO con reservas` / `NO-GO`; no corre build ni tests, los deja listados para el agente principal. Los dos son de solo lectura con el hook `readonly-bash` (ADR-021) y vienen en el preset de Claude Code.
- Fix SEO: el canonical y el hreflang salen como URL absoluta del dominio público (`metadataBase` en el layout). Antes eran relativos y Next los resolvía contra la URL de cada deploy.
- **La bitácora sale del sitio** (ADR-025). El historial queda solo en este `CHANGELOG.md`: se borran la página `/changelog`, su ítem del menú, la tarjeta de la home y su copia en `messages/*.json`. El sitio ya no enlaza al historial y `/changelog` da 404.
- **Menú único "Kits" en el sitio** (ADR-024). Reemplaza "Antigravity solo" y "Claude solo". Cada página del kit tiene arriba un selector `[Antigravity | Claude Code]` y pestañas (Presets por stack · Rules y skills · Subagentes · Armar a medida). Rutas nuevas `/kits/<tool>`, `/kits/<tool>/stacks` y `/kits/<tool>/subagentes`, todas estáticas; las viejas redirigen con 308. Claude Code gana sus presets y sus rules y skills por stack. Color fijo por tool (esmeralda/violeta), y el link "Kits" recuerda el último tool elegido. También: hreflang y canonical por página (antes todas apuntaban a la home) y el selector de idioma ya no pierde el tool en `/build`.
- **Sitio actualizado a Next.js 16, React 19 y Tailwind 4** (ADR-023), con next-intl 4.14 y TypeScript 7. Las páginas se ven igual: se compararon capturas de las 11 páginas antes y después, y el armador de ZIP funciona en los dos tools. `middleware.ts` pasa a `proxy.ts`, la config de Tailwind vive en `globals.css` (`@theme`) y se quitó el script `lint`, porque `next lint` ya no existe. De paso se corrigió un error de next-intl en las páginas en inglés: claves de traducción con punto y 7 claves sin uso desde ADR-020.
- **Subagent nuevo `web-researcher`** (ADR-022), en Claude Code y Antigravity. Investiga en internet sin filtrar datos del usuario ni del proyecto y trata todo lo que trae la web como dato, nunca como instrucción: si una página intenta darle órdenes, la reporta en una sección de Alertas en vez de obedecerla. Solo tiene tools web (no lee archivos, no ejecuta, no escribe), contrasta con 2+ fuentes y cita cada una. En Claude Code, un hook (`.claude/hooks/web-guard.mjs`) revisa cada búsqueda y cada URL antes de que salga y bloquea secretos, emails, rutas locales, tarjetas, bloques codificados en la query y hosts de la red local (también dominios que resuelven a una IP privada). Los términos propios del proyecto se suman en `.claude/web-guard-terms.txt`. El generador ahora empaqueta cualquier hook que un agente nombre, no solo `readonly-bash.mjs`. Los dos hooks pasan a **fallar cerrados** (`|| exit 2` en el comando): si no pueden correr, por ejemplo sin Node, bloquean en vez de dejar pasar. Ojo: Claude Code solo ejecuta los hooks de un agente de proyecto si la carpeta tiene aceptada la confianza del workspace.
- **Subagents de Claude Code reforzados** (ADR-021). Los 5 revisores (`code-reviewer`, `explorer`, `planner`, `security-auditor`, `ui-reviewer`) ya no pueden escribir aunque tengan `Bash`: un hook (`.claude/hooks/readonly-bash.mjs`) deja pasar solo comandos de lectura y bloquea el resto. Viaja en el ZIP; en la instalación como plugin Claude Code ignora los hooks de subagents, así que ahí queda solo la instrucción. `security-auditor` suma autorización por recurso (IDOR), RLS de Supabase, SSRF, secretos en el historial de git, headers, rate limiting, webhooks, supply chain y LLM con tool calls, y cada hallazgo trae el escenario de explotación. `code-reviewer` revisa también datos (queries, schema, migraciones), como el `auditor` de Antigravity. Todos leen `AGENTS.md` § Proyecto; los revisores verifican cada hallazgo antes de reportarlo; `debugger` entrega el test que reproduce el bug para `test-writer`. Campos nuevos: `effort` en los de opus, `maxTurns` en `explorer` y `color` en todos.
- **Los 7 workflows de Antigravity pasan a skills** (ADR-020). Antigravity deja de ejecutar los workflows legacy el 19/10/2026, así que `/grill`, `/new-feature`, `/bug-fix`, `/session-close`, `/security-audit`, `/deploy-checklist` y `/tools-reference` ahora viven en `.agents/skills/<nombre>/SKILL.md` (con `metadata: kind: workflow`) y de ahí salen tanto las skills de Antigravity como los `.claude/commands/` de Claude Code. El ZIP de Antigravity ya no instala nada en `~/.gemini/antigravity/global_workflows/`: los comandos viajan con el proyecto y el paso global queda solo con `GEMINI.md`. Ojo: en Antigravity las skills también pueden activarse solas por su descripción. Quien tenga los workflows viejos instalados puede borrarlos o correr `/migrate-workflows`. De paso, la doc oficial cambió el límite de las rules: 24.000 bytes por archivo y 20.000 tokens entre las Always On (los 12.000 chars quedan solo para workflows legacy).
- Fix: el build de producción fallaba en `/mejores-skill` porque `prelaunch-compliance-audit` no tenía su texto en `messages/*.json`. Se agregó, junto con un chequeo (`site/scripts/check-messages.mjs`, en `predev`/`prebuild`) que corta el build con un mensaje claro si a una skill o plantilla le falta su texto en algún idioma.
- **Skill nueva `prelaunch-compliance-audit`**: audita una web o app antes de lanzarla contra 43 reglas legales, de privacidad, seguridad, accesibilidad, técnicas y SEO, investiga la normativa vigente del país del proyecto y propone arreglos que no aplica sin aprobación; también redacta los textos legales a partir de los hechos del proyecto. Se carga por partes (`SKILL.md` + `references/`), viene preseleccionada en los 7 stacks de los dos kits, se publica en el plugin y `/deploy-checklist` la recomienda en el primer lanzamiento.
- **Cierres de tarea más digeribles** (ADR-019). § 0 suma un formato de cierre: primero el resultado en una frase, hasta 3 viñetas sobre lo que cambia, la revisión en una línea y una sola pregunta al final. El reporte de § 8 deja el bloque de código de 3 líneas: ahora es una línea en texto normal que omite las pasadas que no aplican y solo explica lo que se encontró o corrigió. Pasadas nuevas: 🧪 Verificado (qué se ejecutó de verdad), 📝 Docs y ⚠️ Riesgo (solo si hubo algo irreversible).
- **Se elimina `00_GEMINI_START.md`** (ADR-018). Lo que declaraba (stack real, otra estructura de `/docs`, reglas que no aplican) pasa a la sección **Proyecto** de `AGENTS.md`, que lee cualquier IA. § 5 de `CORE.md` y `GEMINI.md` apunta ahí y queda idéntico en los dos; las plantillas son las mismas para ambos tools. Si un proyecto todavía tiene un `00_GEMINI_START.md`, mover su contenido a `AGENTS.md`: `GEMINI.md` ya no lo lee.
- **Plantillas SDD con trazabilidad y traspaso** (ADR-017): `01_PROJECT_PRD` numera los requisitos (`RF-01`, `RNF-01`) con prioridad y criterios de aceptación en formato EARS; `06_TASKS` abre con un **Estado de traspaso** (dónde quedó, próximo paso, bloqueos, qué no tocar) y cada tarea lleva ID, requisito y criterio de "hecho cuando". Dos plantillas nuevas: `09_TESTING.md` (cómo correr los tests y qué test verifica cada requisito) y `10_RUNBOOK.md` (entornos, deploy, rollback, monitoreo, incidentes). La convención pasa a 01–10 en `CORE.md`/`GEMINI.md`, los workflows, `docs-writer`, `project-planning` y el mapa del `AGENTS.md`.
- `/new-feature` creaba un `06_TASKS.md` con encabezados en inglés y otra estructura que la plantilla; ahora usa la misma.
- Plugin de Claude Code: v2026.10.12.
- **Los kits traen `AGENTS.md`: el proyecto puede continuarlo cualquier IA** (ADR-016). Los dos ZIPs dejan en la raíz del proyecto un `AGENTS.md` con las reglas globales en versión neutral (derivadas de `core/CORE.md` en el build, sin copia manual), un mapa del proyecto (dónde están rules, skills, subagentes y workflows, y cómo retomar el trabajo desde `/docs`) y una sección "Proyecto" para completar. En el kit de Claude Code, `CLAUDE.md` pasa a ser `@AGENTS.md` + lo exclusivo de Claude. En Antigravity es un item nuevo, preseleccionado en los 8 presets, que va a la raíz del proyecto y no a `~/.gemini/`.
- Fix: el bloque de configuración del MCP `codebase-memory` que vive en `core/CORE.md` y `.gemini/GEMINI.md` de este repo viajaba dentro del `CLAUDE.md` y el `GEMINI.md` de los kits. El generador ahora lo quita.
- **`AGENTS.md` en la raíz** (ADR-015): las particularidades del repo (fuente vs. derivados, paridad CORE/GEMINI, comandos, convenciones) pasan a `AGENTS.md`, el estándar abierto que leen Antigravity, Codex, Cursor, Copilot y Gemini CLI. `CLAUDE.md` lo importa con `@AGENTS.md` (con un `CLAUDE.md` presente, Claude Code no lo lee solo) y queda solo con lo exclusivo de Claude. Es del repo, no del kit: no entra en los ZIPs ni en el plugin.
- `.gitattributes` nuevo que fija LF en todo el repo (`* text=auto eol=lf`). En Windows con `core.autocrlf=true` la copia de trabajo quedaba en CRLF y los guards que comparan byte a byte (`build-plugin.mjs --check`) fallaban con contenido idéntico; `sync-claude-kit.mjs` además dejaba 16 archivos "modificados" solo por finales de línea.
- **El contenido de datos del sitio se muda a `messages/*.json`**: las 21 skills del catálogo, los 7 templates de prompt, los labels de stack, los tipos de proyecto, las plantillas SDD y la bitácora quedan traducidos ES/EN. Los archivos de `lib/` pasan a tener solo estructura (ids, links, comandos); la prosa vive en messages. Las descripciones que salen del frontmatter del kit son la excepción: el español sigue siendo el del archivo empaquetado (ADR-009) y `messages/en.json` guarda solo la traducción, con fallback al manifest.
- **Las dos vistas de skills se fusionan**: `/mejores-skill` pasa a tener dos pestañas — lista completa y por tipo de proyecto. `/skills-por-proyecto` redirige. Las dos vistas se renderizan en el HTML estático (se ocultan con `hidden`, no se montan al cambiar de pestaña), así que la página sigue indexable completa.
- `/changelog` sube al nav principal.
- **Los subagentes dejan de ser exclusivos de Claude Code** (ADR-013): Antigravity soporta subagentes declarables en archivo (`.agents/agents/<nombre>/agent.md`), cosa que el generador daba por imposible. El kit suma 4: `auditor` y `security` de solo lectura, `backend` y `frontend` que implementan y verifican su propio trabajo en sandbox. Vienen preseleccionados en los 8 presets de Antigravity.
- `/subagentes` pasa a mostrar los dos catálogos (4 de Antigravity + 8 de Claude Code) con el formato de cada tool, y aparece también en el menú "Antigravity solo". Antes filtraba únicamente `claude-code`.
- Tema visual unificado: `/subagentes`, `/mejores-skill`, `/skills-por-proyecto`, `/prompts` y `/plantillas` pasan a Vibrant Flat UI 3.0. Se arrastraban también `BuildClient`, `ItemPreviewModal` y `DocTemplatesDownload` — el modal de preview del ZIP se abría con fondo blanco sobre el sitio oscuro. Ya no queda ninguna clase `neutral-*` en `site/src`.
- **El repo consume su propio kit — dogfooding** (ADR-010): `CLAUDE.md` en la raíz (importa `core/CORE.md` vía `@`), `claude-agents/` movido a `.claude/agents/` (fuente del manifest e instalación local a la vez), y `.claude/commands/` generado desde los workflows con `scripts/sync-claude-kit.mjs`. Toda sesión de Claude Code en el repo trabaja ahora con las mismas reglas, comandos y subagentes que se distribuyen.
- `GEMINI.md § 3` recupera la paridad con `CORE.md`: se reponen Vue y la fila de base de datos en la tabla de stack. La regla de paridad entre ambos núcleos queda documentada en `CLAUDE.md`.
- README: `database.md` aparecía solo en la tabla de tokens — se agrega al árbol de estructura, al comando de instalación del Paso 2 y a la tabla de triggers. Se corrige la afirmación de que `skills-lock.json` registra "cada" skill vendorizada (solo cubre las instaladas vía `npx skills`; las de `uipro` y `project-docs-scaffold` se versionan por git).
- La tabla de consumo de tokens del README pasa a regenerarse con `scripts/update-token-table.py` (marcadores `token-table:start/end`); los valores estaban desactualizados (~11.165 → ~11.926 el máximo teórico).
- Set SDD de `/docs` completado con contenido real: `01`–`05` redactados para makeRuleIA; `08_CHANGELOG.md` redirige a esta bitácora en vez de duplicarla.
- **El trigger `glob` de Antigravity ahora tiene equivalente en Claude Code**: hook `PostToolUse` (`.claude/settings.json` + `scripts/hooks/stack-conventions-reminder.mjs`) que inyecta el recordatorio de `stack-conventions` al editar archivos de código, una vez por sesión. Era el único modo de activación del kit que se perdía al pasar a Claude.
- Las 9 rules se emiten también como skills locales de Claude Code (`.claude/skills/<id>/SKILL.md`) con `scripts/sync-claude-kit.mjs` (ex `sync-claude-commands.mjs`, ahora cubre comandos + rules) — los subagentes encuentran en este repo las mismas rutas que en un ZIP instalado.
- Guardián de paridad `scripts/check-core-parity.py` para `CORE.md` ↔ `GEMINI.md`: compara las secciones compartidas normalizando las divergencias intencionales (§ 3.2, § 5) y saltando las estructurales (§ 6, § 8). En su primera corrida detectó una divergencia real no documentada en § 3.
- `.claude/settings.json` nuevo con allowlist de permisos (scripts del repo, git de solo lectura) para reducir prompts por sesión.
- `update-token-table.py` gana un guard: una rule o workflow nuevo sin entrada en el script quedaba fuera de la tabla en silencio (lo detectó `grill.md` al sumarse). Ahora falla nombrando el archivo.

- **Regla de idioma corregida para que refleje la realidad** (ADR-009): § 2 de `CORE.md` y `GEMINI.md` decía "Código siempre en inglés", pero el repo tenía 67 comentarios en español contra 15 en inglés. La regla pasa a ser "identificadores y nombres de archivo en inglés; comentarios y documentación en español; respuestas en el idioma del usuario". Se evaluó traducir todo a inglés y se descartó: 4 de las 14 skills empaquetadas son de terceros y están en inglés (habría que forkearlas), el español mide solo 3,8% más que el inglés en texto técnico, y la rule más grande usa el 78% del límite de 12.000 chars de Antigravity — o sea, ninguno de los argumentos a favor de traducir se sostiene.
- **Antigravity y Claude Code pasan a ser kits totalmente independientes** (ADR-006): se elimina el modo de uso híbrido "Antigravity + Claude". Ningún item del manifest pertenece a los dos tools — las plantillas de `/docs`, las skills externas y el add-on de base de datos se emiten una vez por tool, con su propio `id`. Cada ZIP es autocontenido y no menciona ni asume al otro agente. La fuente en disco sigue siendo única: `.agents/rules/` se edita una sola vez y el generador emite los dos formatos.
- El home pasa de 3 modos de uso a 2 y el nav pierde la entrada "Antigravity + Claude"; `/subagentes` se mueve dentro del menú "Claude solo".
- `BuildClient` filtra los items por `tool` a secas — se elimina el caso especial `|| i.category === "template"`, que era el último punto donde los dos catálogos se mezclaban.
- `GEMINI.md` § 8 deja de nombrar a Claude en la regla de auditoría externa: la regla se generaliza a "revisión manual, herramienta de análisis, etc." en vez de eliminarse.
- El `description` de `code-reviewer` ya no promete revisar UI/UX (su cuerpo nunca lo hizo); ahora deriva explícitamente a `ui-reviewer`.
- `explorer` y `planner` explicitan en su `description` qué los diferencia de los agentes `Explore` y `Plan` que Claude Code trae de fábrica: conocen la convención `/docs` 01-08 y las reglas instaladas en `.claude/skills/`.
- Reorganización de la interfaz del sitio: layout, nav, home y tarjetas de skills ajustados.
- Se agrega esta bitácora de cambios (`CHANGELOG.md` + página `/changelog`).
- Nav reorganizado en 3 secciones claras: **Antigravity solo**, **Antigravity + Claude** y **Claude solo**; el catálogo de skills se mantiene como ventana independiente.
- Se fusionan `/stacks` y `/stacks-app` (mostraban la misma info de rules/skills por preset en dos diseños distintos) en una única página `/stacks` con el tema visual actual del sitio.
- Labels del nav normalizados: se reemplazan los tres "Inicio" genéricos por labels descriptivos ("Presets por stack", "Rules y skills por stack", "Armar a medida"); un grupo de un solo ítem ahora se renderiza como link directo en vez de dropdown.
- El proyecto pasa a usar su propia convención `/docs`: se agregan `docs/06_TASKS.md` (backlog activo) y `docs/07_DECISIONS.md` (ADRs) para seguimiento del trabajo.
- `/` pasa a ser el índice del hub (presenta los 3 modos de uso, el catálogo de skills y la bitácora); los presets por stack de Antigravity se mudan a su propia página `/antigravity`. Antes home y presets eran la misma página.

### Agregado

- **El kit de Claude Code como plugin nativo** (ADR-011, implementado; versión por ADR-014): `/plugin marketplace add luiskaco/-makeRuleIA` y después `/plugin install ai-rules-hub@ai-rules-hub`. Publica las 9 rules como skills nativas, los 7 comandos, los 8 subagentes y las 2 skills propias del hub — las de terceros quedan afuera a propósito. Se actualiza desde git en vez de quedar congelado como el ZIP. `scripts/build-plugin.mjs` genera el manifest y `--check` falla si quedó atrás respecto de la fuente. No incluye `CLAUDE.md`: un plugin no instala memoria de proyecto, para eso sigue estando el ZIP.
- **Skill `domain-modeling` y plantilla `CONTEXT.md`** (ADR-012): el kit no tenía dónde vivir el vocabulario del dominio — `04_DATA_MODEL.md` describe entidades técnicas, que es otra cosa. `CONTEXT.md` va **sin numerar** a propósito: los 01-08 son documentos de fase que se escriben en orden, y un glosario se toca continuamente. Se crea recién cuando hay 3 términos que lo justifiquen. La skill viene preseleccionada en los 7 stacks reales.
- **Workflow `/grill`**: interrogatorio estructurado, de a una pregunta por turno, para afilar un plan difuso antes de `/new-feature`. Le da forma concreta a la Regla de Oro (`CORE.md § 1` / `GEMINI.md § 1`), que hasta ahora decía "detenete si hay ambigüedad" sin definir cómo. Fuente única: se emite como workflow de Antigravity y como comando de Claude Code, igual que los otros 6.
- **ADR-011** — el kit de Claude Code se empaquetará como plugin nativo **además** de los ZIPs: el ZIP es una copia congelada que no recibe correcciones posteriores, el plugin se actualiza desde git. Antigravity se queda con los ZIPs porque no tiene un sistema equivalente. Implementación pendiente en `06_TASKS.md`.
- **Dos subagentes nuevos, de 6 a 8** (ADR-007): `ui-reviewer` (accesibilidad, los 5 estados de UI, responsive, SEO on-page y consistencia con el sistema de diseño) y `test-writer` (detecta el framework de test del proyecto en vez de asumirlo, y nunca modifica el código bajo prueba). Cubren los dos huecos del kit: 6 de los 8 stacks entregan interfaz y ninguno tenía revisión de UI, y ningún agente escribía tests.
- Versión en inglés del sitio: i18n con `next-intl`, ruteo `/es` y `/en` (la raíz redirige a `/es`), mensajes en `messages/es.json` y `messages/en.json`, `hreflang` por idioma, `lang` correcto en `<html>` y selector de idioma en el header. Alcance: interfaz del sitio — el contenido empaquetado en los ZIPs sigue en español.

### Quitado

- Modo de uso "Antigravity + Claude": la entrada del nav y la tarjeta del home. Los subagentes no desaparecen — pasan a vivir dentro de "Claude solo", que es a quien pertenecen.
- Páginas placeholder vacías y sin link en el nav: `/proximamente` y `/mejores-repos-utilidades`.

### Arreglado

- **Los `.claude/commands/` no se descargaban.** Los 6 comandos existían en el manifest y se mostraban en `/build`, pero ningún preset de Claude Code los preseleccionaba, así que el ZIP salía sin ellos (`site/src/lib/presets.ts`). La rama de Antigravity sí incluía sus workflows equivalentes.
- **`code-reviewer` apuntaba a rutas inexistentes.** Referenciaba `.agents/rules/security.md` y `.agents/rules/architecture.md`, que no existen en un ZIP de Claude Code — el generador convierte esas rules a `.claude/skills/<id>/SKILL.md`. Solo funcionaba si además se había bajado el ZIP de Antigravity.
- **Segmentos duplicados en todos los ZIPs** (ADR-008): `destFolder()` agregaba un prefijo encima de `destPath`, que ya era la ruta final, generando `docs/docs/01_PROJECT_PRD.md` y `.agents/.agents/rules/architecture.md`. Además no coincidían con los `cp -r` del `INSTALL.md` incluido.
- Contenido específico de Antigravity que se filtraba a los ZIPs de Claude Code: `00_GEMINI_START.md` ya no se incluye en presets de `claude-code` (`site/src/lib/presets.ts`); se generalizaron referencias a `GEMINI.md` en `docs-templates/06_TASKS.md` y en el workflow `new-feature.md` para que también apliquen a `CORE.md` (Claude Code).

## 2026-07-29

### Agregado

- Skill `project-planning` para cerrar el gap entre brainstorming y ejecución.

## 2026-07-28

### Agregado

- Rediseño del sitio a "Vibrant Flat UI 3.0".
- Nueva pestaña `/stacks-app`.
- Nuevos templates de prompt.
- Skill `api-security-best-practices` sumada al catálogo.

## 2026-07-25

### Agregado

- Skills de diseño de terceros versionadas en `.claude/skills/`.
- Catálogo unificado con la estructura de tarjetas del glosario.
- Skills externas sumadas al catálogo + página de glosario con detalle.
- Menú hamburguesa para navegación responsive.
- Reorganización del nav en menús agrupados + catálogo de skills y templates de prompt.

### Quitado

- Skills de diseño gráfico removidas del bundle de `uipro`.

## 2026-07-22

### Cambios

- Se remueve la skill `ui-ux-pro-max`, consolidando su rol en `frontend-design`.

## 2026-07-20

### Agregado

- Pestañas placeholder: "Mejores SKILL", "Próximamente" y "Mejores repos de utilidades".

### Cambios

- Se exige el uso de versiones actualizadas y se corrige la lista de rules.

## 2026-07-15

### Cambios

- El proyecto se enfoca en el workflow Gemini + Claude; se agregan subagentes y se corrige el límite de rules.

## 2026-07-05

### Agregado

- Sitio "Rules Hub" descargable con soporte multi-agente y de base de datos.

### Arreglado

- Responsividad mobile del nav, footer y páginas de build.

## 2026-07-02

### Agregado

- Secciones de PWA, dark mode, i18n y privacidad en las rules.
- Documentación de las skills `frontend-design` y `seo-audit`.

## 2026-06-21

### Cambios

- Reorganización de la estructura del repo a la raíz del proyecto; README actualizado.

## 2026-06-13

### Cambios

- Reorganización de reglas de `antigravity-v2`, eliminación de reglas obsoletas.
- Actualización de las opciones de workflow y la lógica de subagentes en `GEMINI.md`.

### Agregado

- Rules de Antigravity y actualización de instrucciones de agente.

## 2026-06-11

### Agregado

- Documentación de los procesos internos de subagentes para tareas de código.

## 2026-06-07

### Documentación

- Corrección de typo en el workflow de bug-fix.
- Actualización de workflows y README de Antigravity.

## 2026-06-01

### Documentación

- Revisión de README para instalación de Antigravity Rules v2.
- Actualización de `session-close.md`, `new-feature.md` y `GEMINI.md`.

## 2026-05-31

### Agregado

- README raíz del proyecto (`091947e`).
- Actualización de workflows de agentes, skills y documentación.

## 2026-05-24 — 2026-05-30

### Agregado

- Primeras versiones de las rules de gobernanza de IA (`ia_antigravity-rules`, README global, reglas v3/v4).
- Commit inicial: "Reglas para la IA".
