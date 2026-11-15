# CONTEXT — Glosario del dominio

> Vocabulario compartido del proyecto: lo que cada término significa acá, para
> que la conversación, la documentación y el código usen las mismas palabras.
>
> **No** es especificación técnica (`ARCHITECTURE.md`) ni esquema de datos
> (`DATA_MODEL.md`). Solo lenguaje.

## Cómo se usa

- Una entrada por término, en orden alfabético.
- Cada entrada dice qué **es**, qué **no** es (si hay confusión frecuente), y cómo se llama en el código.
- Si un término se descartó a favor de otro, queda como alias obsoleto.

---

## Términos

### `Alternativa`

**Es:** otra tecnología de la misma capa que también es compatible con lo elegido, ordenada por puntaje.

**No es:** una tecnología descartada; esas no se pueden usar con lo elegido.

**En el código:** `LayerResult.alternatives`

### `Capa`

**Es:** una decisión del stack con sus propias opciones (frontend, base de datos, autenticación, deploy…). El orden de las capas importa: una capa solo se apoya en lo que aportaron las anteriores.

**En el código:** `LayerDef`, `LayerId`, `LAYERS`

### `Capacidad`

**Es:** algo que una tecnología aporta o necesita (`js-runtime`, `sql-db`, `python`…). Es lo que impide combinaciones rotas.

**En el código:** `Capability`, `provides`, `needs`

### `Catálogo`

**Es:** el conjunto de fichas de tecnologías. Vive en el repo y se amplía agregando registros.

**En el código:** `CATALOG`, carpeta `src/catalog/`

### `Descartada`

**Es:** una tecnología que no puede usarse en este proyecto, con el motivo (necesita algo ausente, choca con algo elegido, es de pago con presupuesto cero o la excluye una respuesta).

**En el código:** `LayerResult.discarded`

### `Etapa`

**Es:** si el proyecto es un prototipo o un producto en producción. Cambia qué se premia: arranque rápido en el primero, madurez en el segundo.

**En el código:** `ProjectAnswers.scale` (`prototype` / `product`)

### `Ficha`

**Es:** el registro de una tecnología en el catálogo.

**En el código:** `Technology`

### `Fijar`

**Es:** decidir a mano la tecnología de una capa; el resto del stack se adapta.

**En el código:** `RecommendOptions.pinned`

### `Perfil`

**Es:** lo que el usuario domina, conoce, prefiere no usar o ya paga. Ordena, no decide.

**En el código:** `UserProfile`

### `Sin verificar`

**Es:** una ficha cuyos datos se cargaron de memoria y no se contrastaron con documentación vigente. Se marca en pantalla y en lo exportado.

**En el código:** `verifiedAt === null`

### `Stack`

**Es:** el conjunto de tecnologías elegidas, una por capa.

**En el código:** `Recommendation`

### `Tipo de proyecto`

**Es:** la clase de cosa que se construye (landing, e-commerce, SaaS, API, app móvil…). Define qué capas aplican y qué tecnologías tienen sentido.

**En el código:** `ProjectTypeId`, `PROJECT_TYPES`

### `Verificada`

**Es:** una ficha contrastada con documentación vigente en una fecha, con la fuente anotada. La verificación cubre lo que dice `source`, no necesariamente toda la ficha.

**En el código:** `verifiedAt`, `source`

---

## Alias descartados

| Se decía | Ahora se dice | Por qué |
|---|---|---|
| Índice de consistencia | (se eliminó) | Daba una precisión que el motor no tiene |
| Stack AI-First | Stack recomendado | Era el nombre de un único stack fijo del prototipo |
