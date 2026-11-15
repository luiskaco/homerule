# Testing

> Cómo se verifica que el proyecto funciona.

## Cómo correr los tests

```bash
npm install
npm test
```

```bash
npm run typecheck
```

Un archivo o un caso puntual:

```bash
npx vitest run src/engine/recommend.test.ts -t "WordPress"
```

## Estrategia

| Nivel | Qué cubre | Herramienta | Dónde viven |
|---|---|---|---|
| Unitario | Motor de recomendación, armador con avisos, exportación y forma de cada ficha del catálogo | Vitest (entorno `node`) | `src/engine/*.test.ts`, `src/catalog/catalog.test.ts` |
| Integración | Recorrido de más de mil combinaciones de respuestas con invariantes | Vitest | `src/engine/recommend.test.ts` (bloque "invariantes") |
| End-to-end | Sin pruebas automáticas | — | Verificación manual en el navegador |

**Cobertura objetivo:** sin objetivo numérico. Lo que importa es que ninguna combinación de respuestas produzca un stack roto, y eso lo cubren las invariantes.

Invariantes que se comprueban sobre todas las combinaciones: cada elección tiene sus necesidades cubiertas por las anteriores; nada elegido choca con otra elección ni rompe una condición del proyecto; con presupuesto cero no se elige nada de pago; ninguna capa activa queda sin elegida (salvo con presupuesto cero).

## Trazabilidad

| Requisito | Test(s) | Estado |
|---|---|---|
| `RF-01` | `recommend.test.ts` — "landing con SEO crítico…", "WordPress con tienda…", "app con IA activa la capa de IA…", "ninguna capa activa queda sin tecnología elegida…" | ✅ |
| `RF-02` | `recommend.test.ts` — "con FastAPI, el ORM es de Python…", invariantes de necesidades, choques y presupuesto | ✅ |
| `RF-03` | `recommend.test.ts` ("…diciendo por qué") y `export.test.ts` ("alternativas y descartes con su motivo") | ✅ |
| `RF-04` | `recommend.test.ts` — "fijar una tecnología incompatible lo dice…" | ✅ |
| `RF-05` | `recommend.test.ts` — "el perfil sube el puntaje… pero no decide solo" | ✅ |
| `RF-06` | `recommend.test.ts` — "a igual puntaje gana la verificada"; `catalog.test.ts` — "una tecnología verificada dice contra qué" | ✅ |
| `RF-07` | `export.test.ts` — bloque de AGENTS.md, celdas sin `\|` sueltos, ADR, nombres sin verificar, y el bloque de un stack armado a mano | ✅ |
| `RF-09` | `assemble.test.ts` — "ninguna combinación se bloquea", "estados de cada capa", "opciones de una capa" | ✅ |
| `RF-10` | `assemble.test.ts` — "avisos con motivo", "PHP, Laravel y Bootstrap"; `export.test.ts` — avisos en bloque y ADR | ✅ |
| `RF-11` | Sin test automático: la lógica vive en `App.tsx` (`suggest`) | pendiente |
| `RF-08` | Verificación manual (se guardó y se leyó de `localStorage`) | pendiente de test automático |
| `RNF-01` | `recommend.test.ts` — "es determinista" | ✅ |
| `RNF-02` | Revisión de código: no hay llamadas de red en `src/` | pendiente de test automático |
| `RNF-03` | Verificación manual parcial (por texto y estructura, sin captura) | pendiente (T-03) |
| `RNF-04` | `catalog.test.ts` — integridad del catálogo | ✅ |

## Datos de prueba

No hay datos de prueba externos. Los casos definen sus respuestas en el propio test y
`recommend` acepta un `catalog` inyectado para aislar reglas.

## En CI

Todavía no hay CI (T-07). Cuando exista, `npm run typecheck` y `npm test` bloquean el merge.

## Fuera de alcance / deuda

- No hay tests de componentes de React: la lógica vive en el motor y la interfaz es fina. Se agregan si la interfaz gana lógica.
- El guardado en `localStorage` no tiene test automático.
