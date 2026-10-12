# 09 — Testing

> Cómo se verifica que el proyecto funciona. Quien retome el trabajo (persona u
> otra IA) tiene que poder correr los tests y saber qué cubren sin preguntar.

## Cómo correr los tests

```bash
# instalar dependencias de test (si aplica)
# correr todo
# correr un archivo / un test puntual
# cobertura
```

## Estrategia

_Qué nivel cubre qué. Ajustar la tabla al proyecto real — no todos los
proyectos necesitan los tres niveles._

| Nivel | Qué cubre | Herramienta | Dónde viven |
|---|---|---|---|
| Unitario | Lógica pura: servicios, utilidades, validaciones | | |
| Integración | Endpoints, acceso a datos, integraciones externas (con dobles) | | |
| End-to-end | Flujos críticos del usuario de punta a punta | | |

**Cobertura objetivo:** _número y alcance (ej. 80 % de líneas en `services/`) —
o "sin objetivo numérico" con el motivo._

## Trazabilidad

_Cada criterio de aceptación de `01_PROJECT_PRD.md` tiene al menos un test que
lo verifica. Un requisito sin test no se da por cumplido en `06_TASKS.md`._

| Requisito | Test(s) | Estado |
|---|---|---|
| `RF-01` | `ruta/al/test` — _nombre del caso_ | ✅ / ❌ / pendiente |

## Datos de prueba

_Fixtures, seeds y factories: dónde están y cómo se regeneran. Nunca datos
reales de usuarios ni credenciales de producción._

## En CI

_Qué tests corren en cada push / PR, cuáles bloquean el merge y cuáles no
(ej. e2e nocturnos)._

## Fuera de alcance / deuda

_Lo que hoy no se testea a propósito y por qué — para que no se lea como
olvido._
