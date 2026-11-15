# Modelo de datos

Definidos en `src/domain/types.ts`. No hay base de datos.

## Entidades

### `Technology`

Una ficha del catálogo.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | string | Único y estable; lo referencian `conflicts`, el perfil y las fijadas |
| `name` | string | Nombre para mostrar |
| `layer` | `LayerId` | Capa a la que pertenece |
| `types` | `ProjectTypeId[] \| 'all'` | Tipos de proyecto donde tiene sentido |
| `solves` | string | Para qué sirve, en una frase |
| `traits` | `Trait[]` | Cualidades que el motor premia (`seo-friendly`, `quick-start`, `mature`…) |
| `bestFor` | `ProjectTypeId[]` | Tipos donde suele ser la primera opción |
| `provides` / `needs` | `Capability[]` / `Need[]` | Lo que aporta y lo que exige. Un `Need` en arreglo significa "alguna de estas" |
| `conflicts` | string[] | Ids con los que choca (se comprueba en los dos sentidos) |
| `excludeWhen` | `Condition[]` | Respuestas del proyecto que la descartan |
| `avoidWhen` | string[] | Cuándo conviene evitarla (texto para mostrar) |
| `cost` | `free \| freemium \| usage \| paid` | Costo para quien la usa |
| `isNone` | boolean | Opción "no hace falta" o ya incluida: no se lista como pieza a instalar |
| `verifiedAt` | `AAAA-MM-DD \| null` | Fecha de la última verificación contra documentación vigente |
| `source` | string | Con qué se verificó y qué parte de la ficha cubre; vacío si no se verificó |

### `ProjectAnswers`

`type`, `seo` (`none/useful/critical`), `realtime`, `needsUsers`, `needsPayments`,
`needsFiles`, `needsEmail`, `needsAI`, `hosting` (`serverless/own-server/any`),
`budget` (`free/low/flexible`), `scale` (`prototype/product`).

### `UserProfile`

`skills`: id de tecnología → `master | know | never`. `alreadyPaying`: ids de lo que ya paga.

### `LayerDef`

`id`, `label`, `appliesTo` (tipos o `'all'`) y `active` opcional (función de las respuestas).

### `Recommendation`

`answers` normalizadas y, por capa, un `LayerResult`: `chosen`, `alternatives` (hasta 3),
`discarded` (con el motivo) y `note` cuando no hay elegida.

## Relaciones

- Una `Technology` pertenece a una capa y aplica a varios tipos de proyecto.
- Las capacidades conectan fichas entre capas: `provides` de una elección anterior satisface el `needs` de una posterior.
- El orden de `LAYERS` define qué capas pueden apoyarse en cuáles.

## Migraciones

No hay base. Lo guardado en `localStorage` lleva versión en la clave (`:v1`). Se valida al
leerlo: si no tiene la forma esperada se ignora. Un cambio incompatible sube la versión a `:v2`.
