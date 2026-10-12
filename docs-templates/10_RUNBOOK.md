# 10 — Runbook

> Cómo se despliega, se opera y se recupera el proyecto. Escribirlo a más
> tardar en el primer deploy. Sin secretos: los valores viven en el gestor de
> secretos o en el `.env` local — acá solo los nombres (detalle en
> `03_SYSTEM_SPEC.md`).

## Entornos

| Entorno | URL | Rama / origen | Hosting | Notas |
|---|---|---|---|---|
| dev | `localhost` | cualquiera | local | |
| staging | | | | |
| producción | | | | |

## Deploy

_Pasos exactos, en orden. Si es automático (CI/CD), qué lo dispara y dónde se
ve el resultado._

1.

**Verificación post-deploy:** _qué revisar para dar el deploy por bueno
(health check, flujo crítico, logs sin errores nuevos)._

## Rollback

_Cómo volver a la versión anterior y cuánto tarda. Si hay migraciones de base
de datos, cómo se revierten — o por qué no se pueden revertir (ver
`07_DECISIONS.md`)._

1.

## Monitoreo y alertas

_Dónde se ven los logs, las métricas y los errores; qué alertas existen y a
quién notifican._

## Incidentes conocidos

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| | | |

## Backups y restauración

_Qué se respalda, con qué frecuencia, dónde, y cómo se restaura. Un backup que
nunca se probó restaurar no cuenta como backup._

## Accesos

_Qué cuentas o servicios hacen falta para operar (hosting, DNS, base de datos,
monitoreo) y quién los administra. Sin credenciales._
