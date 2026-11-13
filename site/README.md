# Homerule — sitio

Sitio Next.js que entrega el kit de este repo en dos piezas (ADR-039):

- **`/instalar`** — el kit global de Claude Code, Antigravity o Codex, una vez por
  máquina. El ZIP trae `kit.json` y el instalador (`scripts/install-global.mjs`,
  el mismo que se usa desde el repo).
- **`/proyecto-nuevo`** — `docs/` (los 4 fijos y los opcionales que se tilden),
  `AGENTS.md` y `CLAUDE.md` para la raíz de un proyecto.

Además, `/catalogo` muestra qué hace cada rule, comando y subagente, `/mejores-skill`
las skills (del kit y de terceros) y `/prompts` los templates de prompt.

## Desarrollo local

```bash
cd site
npm install
npm run dev
```

`npm run dev` corre `predev` primero: `scripts/generate-manifest.mjs` regenera
`public/manifest.json` y los kits de `public/global-kit/` a partir del contenido
del repo (un nivel arriba de `/site`), y `scripts/check-messages.mjs` verifica que
cada skill y plantilla tenga su texto en `messages/`. Si editás una rule, skill o
plantilla, reiniciá el dev server (o corré `npm run generate-manifest`).

## Agregar contenido nuevo

El generador recoge todo por carpeta: no hace falta tocarlo salvo que cambie la
estructura del repo.

- **Rule nueva**: el `.md` en `.agents/rules/`.
- **Skill nueva**: la carpeta en `.agents/skills/<nombre>/` con su `SKILL.md`, y su
  texto en `messages/*.json` bajo `SkillData.<id>`.
- **Plantilla de `docs/`**: el `.md` en `docs-templates/`, y su descripción en
  `messages/*.json` bajo `DocTemplates.descriptions.<archivo>`. Las 4 fijas están en
  `FIXED` de `src/app/[locale]/proyecto-nuevo/page.tsx`.
- **Subagente**: el `.md` en `.claude/agents/` (Claude Code) o la carpeta en
  `.agents/agents/<nombre>/` (Antigravity).

Qué va a cada carpeta personal lo decide `scripts/lib/global-kit.mjs`, en la raíz
del repo: lo usan el generador y el instalador, así el ZIP y el repo instalan lo
mismo.

## Deploy a Vercel

Este sitio vive en un subdirectorio del repo (`/site`), no en la raíz.

1. En [vercel.com/new](https://vercel.com/new), importar el repo `makeRuleIA`.
2. En **Root Directory**, seleccionar `site`.
3. Framework Preset: Next.js (autodetectado).
4. Build Command / Install Command: los defaults (`npm run build` / `npm install`):
   el `prebuild` genera el manifest y los kits antes del build de Next.
5. Deploy.

No requiere variables de entorno ni base de datos: todo se resuelve en build time
y los ZIPs se arman en el navegador del usuario.
