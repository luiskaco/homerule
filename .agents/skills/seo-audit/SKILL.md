---
name: seo-audit
description: >
  Audita, revisa o diagnostica problemas de SEO en el sitio — SEO técnico,
  meta tags, page speed, Core Web Vitals, errores de crawl/indexación,
  caídas de tráfico o ranking.
  Usar cuando se pida auditar SEO, diagnosticar por qué no rankea, o algo
  vago como "revisá el SEO" o "ayudame con SEO".
  Diagnóstico únicamente — los umbrales y specs concretos de este proyecto
  viven en .agents/rules/seo.md y tienen prioridad sobre cualquier sugerencia
  genérica de la skill.
install: "npx skills add https://github.com/coreyhaines31/marketingskills --skill seo-audit"
---

# SEO Audit

Skill de la categoría SEO dentro del paquete
[coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills)
— un repo grande de skills de marketing (pricing, onboarding, social, etc.).
Solo se instala `seo-audit`, no el paquete completo.

## Cuándo activarla

Al auditar o diagnosticar problemas de SEO: caídas de tráfico, páginas que no
indexan, dudas de on-page SEO, o pedidos vagos tipo "revisá el SEO de esto".

No reemplaza [`seo.md`](../../rules/seo.md) — esa regla es la fuente de verdad
del proyecto (specs de title/description, imagen OG, umbrales de Lighthouse,
structured data). Usar `seo-audit` para **detectar** qué está roto; los valores
concretos para **corregirlo** son los del archivo de reglas, no los que sugiera
la skill.

Relacionada con otras skills del mismo paquete si en algún momento se
necesitan (no instaladas por defecto en este proyecto):
- `schema` — structured data / JSON-LD
- `programmatic-seo` — páginas a escala por keyword/ubicación
- `site-architecture` — jerarquía de páginas y navegación

## Instalación

```bash
npx skills add https://github.com/coreyhaines31/marketingskills --skill seo-audit
```

## Flujo de uso

1. Correr la auditoría ante señales de problema (caída de tráfico, páginas
   sin indexar, dudas de on-page SEO).
2. Cruzar los hallazgos contra `seo.md` — si la skill sugiere un umbral
   distinto al ya definido ahí (ej. Lighthouse, tamaño de OG image), gana el
   archivo de reglas.
3. Corregir con las specs del proyecto, no con el default genérico de la skill.
