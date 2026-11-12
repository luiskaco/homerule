# Carga, progreso y estados

Toda acción necesita una respuesta visible en menos de 100 ms, aunque el
resultado tarde más. Los 5 estados obligatorios están en la regla `ui-ux`;
acá, cómo resolver cada uno.

## Carga

| Espera | Patrón |
|---|---|
| Menos de ~300 ms | Nada: un indicador ahí produce parpadeo |
| Contenido con estructura conocida (lista, tarjeta, perfil) | Skeleton con la forma real |
| Acción de un botón (guardar, enviar) | Spinner dentro del botón y botón deshabilitado durante el envío |
| Proceso con duración medible (subida, importación) | Barra de progreso con porcentaje |
| Proceso largo sin duración conocida | Barra indeterminada y texto de qué está pasando |
| Más de ~10 segundos | Seguir en segundo plano y avisar con un toast al terminar |

- **Skeleton:** imita el layout real para que no salte al cargar. No se
  muestra en cargas instantáneas.
- **Optimistic UI:** mostrar el resultado antes de que el servidor confirme,
  en acciones que casi nunca fallan (un "me gusta", mover una tarjeta). Si
  falla, se revierte y se avisa. Nunca en pagos ni en borrados.

## Estado vacío

Es el que más se olvida. Tres casos distintos:

- **Primera vez:** todavía no hay datos. Explica qué va a aparecer y ofrece la
  acción para crear el primero.
- **Sin resultados:** una búsqueda o un filtro no encontró nada. Muestra qué se
  buscó y cómo ampliar la búsqueda o limpiar los filtros.
- **Todo hecho:** la bandeja quedó vacía porque se terminó el trabajo. Un
  mensaje positivo, sin acción obligatoria.

## Error

- Dice qué pasó y qué hacer, en lenguaje del usuario: "No se pudo guardar.
  Revisá tu conexión y probá de nuevo", no "Error 500".
- Ofrece una acción para recuperarse: reintentar, volver o contactar.
- Lo que el usuario escribió no se pierde.
- Error de un campo: junto al campo. Error de toda la página: arriba, con
  `role="alert"`.

## Parcial

Parte de los datos llegó y parte no (un widget de un dashboard falló). Mostrar
lo que hay, marcar lo que falta con su propio error y su botón de reintentar.
Nunca tirar toda la vista por una parte.

## Éxito y confirmaciones

| Acción | Confirmación |
|---|---|
| Chica y visible (marcar, mover) | El cambio en pantalla alcanza |
| Guardar un formulario | Toast breve o mensaje junto al botón |
| Completar un flujo (compra, registro) | Página o pantalla de confirmación con el próximo paso |
| Borrar | Toast con "Deshacer" durante unos segundos |
