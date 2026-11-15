# Propuesta — Armador libre de stack

> Documento de traspaso para continuar el proyecto con otro agente o sesión.
> Estado: **propuesta sin implementar**. Escrito el 2026-11-08. Lo primero que hay
> que hacer es leer `AGENTS.md`, `docs/02_TASKS.md` y `docs/03_DECISIONS.md`.

## 1. Por qué existe este documento

La versión 0.1.0 (commit `54de542`) es un **recomendador**: el usuario responde
preguntas y la app propone un stack. Al probarla, el usuario (Luis) dijo que no era lo
que imaginaba. Lo que quiere:

- Una vista donde **elegir de distintos conjuntos de tecnologías**, y poder **armar el
  stack a su gusto, no solo el que sugiere la app**.
- Poder **combinar libremente**: React con Python, con Node o con PHP; con cualquier
  base de datos; con CSS puro o con Bootstrap, por ejemplo.
- Conservar el **bloque para `AGENTS.md` y el ADR**: dice que agiliza mucho el trabajo.
- Una **interfaz más amigable visualmente**: la actual no le gusta.

El origen del proyecto fue un HTML (`ai_stack_architect_dashboard.tsx`, en la raíz)
que resumía un video de YouTube sobre una forma de trabajar con IA. Tenía un modo
"Armar mi stack" donde se cambiaba la tecnología de cada capa. Esa idea es la que
hay que recuperar, sin las limitaciones de ese prototipo (un único stack fijo, sin
avisos de incompatibilidad, tecnologías limitadas).

También señaló que la interfaz actual confunde: no se ve que las capas dependen unas
de otras, ni qué fijó él y qué eligió el sistema.

## 2. Qué se propone

1. **Dos modos en la misma pantalla.**
   - **Armar el mío:** cada capa muestra *todas* las tecnologías del catálogo que
     existen para ella, sin filtrar por compatibilidad. El usuario elige una (o "no
     uso nada").
   - **Sugerido:** lo que existe hoy. Recomienda según las respuestas.
2. **Avisos en lugar de bloqueos.** Si la combinación elegida tiene un problema, se
   marca ("Express necesita Node y elegiste Python", "choca con X") pero **la
   decisión es del usuario**. El motor actual ya calcula esos motivos (`discarded.why`):
   hay que reutilizarlos como avisos.
3. **Catálogo más ancho.** Faltan al menos PHP (por ejemplo Laravel), Bootstrap y otros
   backends y librerías de estilos. Cada capa debe permitir "no uso nada".
4. **Pantalla rediseñada.** Cada capa como un selector de fichas, un resumen fijo del
   stack armado y la exportación siempre a mano.

**Decisión confirmada por el usuario (2026-11-08):** **armador primero**. La pantalla
abre en "Armar el mío" y un botón "Sugerime uno" lo rellena según las respuestas.

## 3. Cómo encaja con lo que ya existe

Se puede reutilizar casi todo:

| Pieza | Qué hacer |
|---|---|
| `src/engine/recommend.ts` | Reutilizar. Agregar una función que evalúe una **selección manual** y devuelva los avisos, sin elegir por el usuario. `recommend` queda para el botón "Sugerime uno" |
| `src/engine/export.ts` | Reutilizar. Debe aceptar una selección manual (hoy recibe una `Recommendation`). El bloque y el ADR deben decir que el stack lo armó el usuario |
| `src/catalog/` | Ampliar con fichas nuevas. No tocar el motor para agregar una |
| `src/domain/types.ts` | Agregar el tipo de la selección manual (capa → id de tecnología o "ninguna") |
| `src/ui/` | Rediseñar. Los componentes actuales se pueden reemplazar |
| Perfil y guardado local | Se mantienen |

Hoy el motor **filtra** por compatibilidad. El armador necesita lo contrario: mostrar
todo y **avisar**. Eso implica separar dos funciones: una que lista las opciones de una
capa con su estado (compatible o con aviso y motivo), y otra que elige.

## 4. Tareas

Seguir el flujo del repo: registrar en `docs/02_TASKS.md` antes de codificar.

- [x] **A-01 — Selección manual y avisos en el motor.** _(2026-11-08: `src/engine/assemble.ts` con `evaluateSelection` y `layerOptions`; 14 tests en `assemble.test.ts`)_ Nueva función pura con tests.
  - Hecho cuando: dada una selección por capa devuelve, para cada una, los avisos con
    su motivo; ninguna combinación se bloquea; los tests cubren mismo-lenguaje,
    capacidad ausente, choque y presupuesto.
- [x] **A-02 — Ampliar el catálogo.** _(2026-11-08: sumados `laravel`, `laravel-auth`, `bootstrap` y `pest`, sin verificar; "no uso nada" ya existe como `isNone` en backend, ORM y auth. Quedan opcionales: Spring Boot, ASP.NET, Rails, Sass, HTMX)_ PHP/Laravel, Bootstrap, otros backends y estilos,
  y "no uso nada" donde falte.
  - Hecho cuando: React se puede combinar con Node, Python y PHP; hay CSS puro, Tailwind
    y Bootstrap; `npm test` pasa, incluido el recorrido de combinaciones.
  - Las fichas nuevas quedan **sin verificar** (`verifiedAt: null`) hasta contrastarlas
    con documentación vigente. No marcar verificado de memoria.
- [x] **A-03 — Exportación desde una selección manual.** _(2026-11-08: `buildManualAgentsBlock` y `buildManualDecisionRecord` en `export.ts`; 8 tests)_
  - Hecho cuando: el bloque de `AGENTS.md` y el ADR salen de un stack armado a mano e
    incluyen los avisos que quedaron sin resolver.
- [x] **A-04 — Rediseño de la pantalla.** Ver sección 5. _(2026-11-08: implementado y aprobado por el usuario al verlo en el navegador; faltan capturas en 375 px y revisión por teclado, ver T-03)_
  - Hecho cuando: se puede armar un stack completo a mano, pasar a "Sugerime uno", y
    exportar, sin leer documentación. Con captura de pantalla en claro, oscuro y 375 px.
- [x] **A-05 — Actualizar documentación.** _(2026-11-08: PRD con RF-09 a RF-11, ADR-006, CHANGELOG y TESTING)_ `01_PRD.md` (nuevos RF),
  `03_DECISIONS.md` (ADR-006), `TESTING.md`, `04_CHANGELOG.md` y el estado de traspaso.

## 5. Notas de diseño de la pantalla

El usuario dijo que la interfaz actual "no es amigable visualmente". No hay un diseño
cerrado: hay que proponerlo. Pautas:

- Para trabajo de UI de una pantalla nueva el repo indica la skill **`hallmark`**
  (ver `CLAUDE.md`). Usar una sola skill de diseño por tarea.
- Cada capa debe ser un **selector de fichas** (nombre, qué hace en una frase, costo,
  estado de verificación), con la elegida resaltada y la opción "no uso nada".
- El **resumen del stack armado** va fijo, siempre visible, con los avisos pendientes.
- Hacer visible el **orden y la dependencia** entre capas ("Depende de: PostgreSQL +
  Express") y marcar qué cambió cuando una elección mueve otra.
- Distinguir **"elegida por vos"** de **"sugerida"**.
- No presentar como tecnología a instalar lo que significa "no hace falta nada"
  ("SQL directo", "SDK del proveedor", "rutas del framework"): marcarlas distinto.
- Accesible por teclado, modo claro y oscuro, sin scroll horizontal en 375 px.
  Texto de interfaz en español; identificadores en inglés.

## 6. Qué no cambiar

- La **verificación** de fichas: solo se pone `verifiedAt` y `source` después de
  contrastar con documentación vigente (Context7 u oficial). Hoy hay 26 de 93.
- La **verificación solo desempata**, no suma puntos (ADR-003).
- Sin backend, sin cuentas, sin enviar datos fuera del navegador (RNF-02).
- Las rules del kit y las excepciones anotadas en `AGENTS.md`.
- Los pesos de `scoreTech`: se ajustan solo después de probar con 3 proyectos reales
  (T-02 en `02_TASKS.md`).

## 7. Cómo verificar

```bash
npm install
npm run typecheck
npm test
npm run dev
```

La app queda en `http://localhost:5173`. Los tests corren en `node`; no hay tests de
componentes, así que la interfaz se prueba a mano en el navegador.

## 8. Estado actual del repo

- Un commit en `main` (`54de542`), sin remoto. Después de ese commit solo se agregaron
  este documento y el ajuste de `docs/02_TASKS.md`, sin commitear.
- Identidad de git local del repo: Luis Gomez con el correo privado de GitHub. No
  cambiarla.
- `ai_stack_architect_dashboard.tsx` sigue en la raíz, sin usarse. Sirve de referencia
  para el modo "Armar mi stack" del video; decidir si se archiva o se borra.
- El servidor de desarrollo puede estar corriendo en el puerto 5173.
