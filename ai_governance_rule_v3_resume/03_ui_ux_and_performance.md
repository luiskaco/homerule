# UI/UX & Performance Rules

## 1. Principios de Interfaz y Experiencia
- **Diseño:** Claridad visual, consistencia, responsive design y experiencia intuitiva.
- **Estados Obligatorios de UI:** Toda vista/componente dinámico debe incluir estados de: loading, skeleton, error, success y empty.

## 2. Reglas de Skeletons y Accesibilidad
- **Skeletons:** Evitar layout shifts (CLS), representar la estructura real y tener transiciones suaves.
- **Accesibilidad:** Navegación por teclado completa, labels correctos y contraste adecuado de colores.
- **Referencias visuales conceptuales:** Taste-Skill, Skill, Impeccable.

## 3. Rendimiento y Optimización
- **Optimizar proactivamente:** Lazy loading, tamaño de bundles, optimización de imágenes, estrategias de caching, queries eficientes y renderizados controlados.
- **Evitar estrictamente:** N+1 queries en base de datos, renders innecesarios en el cliente y assets pesados sin procesar.