# AI Rules Hub

Sitio Next.js que empaqueta el contenido de este repo (`.gemini/`,
`.agents/rules/`, `.agents/skills/`, `.claude/agents/`, `docs-templates/`) en
ZIPs descargables por stack, para Antigravity/Gemini y Claude Code.

## Desarrollo local

```bash
cd site
npm install
npm run dev
```

`npm run dev` corre `predev` primero, que ejecuta
`scripts/generate-manifest.mjs` y regenera `src/generated/manifest.json` a
partir del contenido actual del repo (un nivel arriba de `/site`). Si editás
una rule, skill o plantilla, hay que reiniciar el dev server (o correr
`npm run generate-manifest` manualmente) para que el sitio vea el cambio.

## Agregar contenido nuevo

- **Rule nueva**: agregar el `.md` a `.agents/rules/` y sumarlo en
  `site/src/lib/presets.ts` a los stacks que corresponda.
- **Skill nueva**: agregar la carpeta a `.agents/skills/<nombre>/` con su
  `SKILL.md` (con frontmatter `description`) y sumarla en `presets.ts`.
- **Stack nuevo**: agregar una entrada al array `presets` en
  `site/src/lib/presets.ts` — no requiere tocar el generador de manifest.
- **Plantilla SDD**: agregar el `.md` a `docs-templates/` en la raíz del
  repo.
- **Subagente de Claude Code nuevo**: agregar el `.md` a `.claude/agents/` en
  la raíz del repo, con frontmatter `name`, `description`, `tools` y
  `model`. Se levanta solo (categoría `agent`, tool `claude-code`) y se
  incluye por default en todos los stacks de Claude Code — sumarlo/sacarlo
  de un stack puntual se hace en `CLAUDE_AGENT_ITEM_IDS` en `presets.ts`.
  No se genera a partir de `.agents/rules/`: se escribe a mano y es exclusivo
  de Claude Code.

**Regla de oro del catálogo:** Antigravity y Claude Code son kits estancos.
Ningún item del manifest pertenece a los dos — lo que aplica a ambos (skills
externas, plantillas de `/docs`, el add-on de base de datos) se emite una vez
por tool, con su propio `id` prefijado. La vista de `/build` filtra por `tool`
a secas, sin excepciones por categoría, y cada ZIP es autocontenido.

El generador de manifest recoge todo automáticamente por carpeta — no hace
falta tocar `scripts/generate-manifest.mjs` salvo que cambie la estructura de
carpetas del repo.

## Deploy a Vercel

Este sitio vive en un subdirectorio del repo (`/site`), no en la raíz.

1. En [vercel.com/new](https://vercel.com/new), importar el repo
   `makeRuleIA`.
2. En **Root Directory**, seleccionar `site`.
3. Framework Preset: Next.js (autodetectado).
4. Build Command / Install Command: dejar los defaults (`npm run build` /
   `npm install`) — el `prebuild` genera el manifest antes del build de Next.
5. Deploy.

No requiere variables de entorno ni base de datos — todo el contenido se
resuelve en build time y el ZIP se arma en el navegador del usuario.
