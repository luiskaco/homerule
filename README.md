# AI Rules Hub

**English** · [Español](README.es.md)

A kit of rules, skills, commands and subagents for working with AI in **Claude Code**,
**Antigravity** and **Codex**. You install it once in your home folder and it applies
to every project (ADR-038). Each project only carries its documentation in `docs/` and
an **`AGENTS.md`** with the essentials: whoever clones it brings their own way of
working (ADR-036).

The site (`site/`) delivers both pieces (ADR-039): the global kit for each tool, with
its installer, and a starter for new projects (`docs/`, `AGENTS.md` and `CLAUDE.md`).

Context loads selectively: nothing is read in full on every message except what is
strictly "Always On".

> The kit's content (rules, skills, commands, agents and `docs/` templates) is written
> in Spanish (ADR-009). The AI answers in the user's language.

---

## Structure

```
~/.claude/                  # Claude Code: CLAUDE.md, skills/ (rules and skills), commands/, agents/, hooks/
~/.gemini/                  # Antigravity: GEMINI.md and config/{rules,skills,agents}/
~/.codex/AGENTS.md          # Codex: general rules
~/.agents/skills/           # Codex: rules, skills and commands as skills

[project]/
├── AGENTS.md               # the project essentials, for any AI or person (ADR-036)
├── CLAUDE.md               # only imports AGENTS.md
└── docs/                   # 01_PRD, 02_TASKS, 03_DECISIONS, 04_CHANGELOG and the optional ones
```

Rules activate on their own based on what you're working on (security, database, UI,
SEO…), so the kit installs whole. If a project deviates from a rule, the deviation goes
in its `AGENTS.md`, which takes precedence over the kit.

---

## Installation

### From the website

On `/instalar`, pick your tool and download the ZIP. It contains the kit and the same
installer used from the repo. It requires Node 24 or newer.

```bash
node install.mjs           # shows what will change
node install.mjs --write   # installs, with a backup
```

To start a project, `/proyecto-nuevo` builds a ZIP with `docs/`, `AGENTS.md` and
`CLAUDE.md`.

### From the repo

Installs the kit once in your home folder, for Claude Code, Antigravity and Codex at
the same time (ADR-038).

```bash
git clone https://github.com/luiskaco/-makeRuleIA.git
```

```bash
node scripts/install-global.mjs --write
```

Without `--write` it only shows what would change. To update: `git pull` and run it
again. It leaves a backup in `kit-backup/`, removes what the kit no longer ships and
never overwrites a file of yours with the same name.

### Claude Code as a plugin

The plugin updates from git: `/plugin update` brings the fixes released after you
installed it. The `/instalar` ZIP, instead, updates when you download it again.

```
/plugin marketplace add luiskaco/-makeRuleIA
/plugin install ai-rules-hub@ai-rules-hub
```

It ships the 9 rules as native skills, the 7 commands and 8 of the 10 subagents:
`server-inspector` and `server-operator` are ZIP-only, because the plugin ignores the
hook that controls them (ADR-026). It does **not** ship `CLAUDE.md` or `AGENTS.md`: a
plugin provides commands, agents and skills, not project memory. For the global core,
install the kit from `/instalar`.

Third-party skills (`hallmark`, `impeccable`, the Vercel ones, etc.) are deliberately
not in the plugin: install them from their original repo, with the command listed in
the catalog.

### Context7 (optional, per project)

Up-to-date library documentation for the AI. It's an MCP server, not a skill, so it
isn't part of the kit:

```bash
npx ctx7 setup
```

---

## Rules: activation modes

`GEMINI.md` (`~/.gemini/`) and `CLAUDE.md` (`~/.claude/`) are Always On: they are read
on every message, no exceptions.

Each rule defines its mode in the frontmatter (`trigger`) and, except `manual`, a
`description` that tells the model when to activate it on its own.

| File | Trigger | Activates when… |
|---|---|---|
| `security.md` | Model Decision | Auth, API endpoints, input validation, uploads, secrets, CORS |
| `architecture.md` | Model Decision | A new module or file, deciding which layer or folder something goes in |
| `ui-ux.md` | Model Decision | Interfaces, visual components, forms, loading/error states, accessibility, dark mode, i18n |
| `seo.md` | Model Decision | Meta tags, Open Graph, structured data, canonical, hreflang, Core Web Vitals as a ranking factor |
| `pwa.md` | Model Decision | Manifest, service worker, cache, offline state, update flow — **only if the project is a PWA** |
| `operations.md` | Model Decision | CI/CD, logging, infrastructure, agent/LLM integration |
| `cms.md` | Model Decision | WordPress, Drupal, or a headless CMS (Sanity, Contentful, Strapi) |
| `database.md` | Model Decision | Schema design, migrations, ORM choice, pooling, indexes, DB credentials |
| `stack-conventions.md` | Glob `*.tsx,*.ts,*.jsx,*.js,*.py,*.php,*.css` | When editing any file of those types |

> `tools-reference` is deliberately **not** in this table: it's a command, not a rule.
> See the Workflows table below.

If a rule and a workflow describe the same thing (e.g. the security checklist in
`/security-audit` vs. the detail in `security.md`), **the rule is the source of
truth**: workflows are operational summaries, not the full documentation.

---

## Workflows

7 workflows, implemented as skills (ADR-020): **invoke them by typing the command in
the chat.** In Claude Code they are commands and only run when you type them; in
Antigravity they are skills, so they can also activate on their own when the task
matches their description. In Codex they are skills invoked with `$` and the name.
Lines like "Reminder: invoke `/session-close`" inside a workflow are prompts for you to
type the next command: they don't chain automatically.

| Command | When to invoke it | What it does |
|---|---|---|
| `/grill` | Before `/new-feature`, when the plan is still fuzzy or you bring an idea instead of a requirement | Asks one question per turn until the real problem, edge cases, out-of-scope items, irreversible decisions and done criteria are settled. Ends with a summary that feeds the next workflow |
| `/new-feature` | Before starting any new task | Defines the plan, creates the git branch (`feat/...` or `fix/...`), creates or updates `02_TASKS.md`, records an ADR if there's an architectural decision. Waits for your approval before coding |
| `/bug-fix` | Something is broken | Finds the root cause before touching code, assesses impact, creates a `fix/...` branch, proposes a 2-3 step plan and waits for approval |
| `/session-close` | At the end of the day or a task | Updates the relevant `/docs` files, checks the build and the tested flow, removes closed tasks from `02_TASKS.md` leaving a line in `04_CHANGELOG.md`, rewrites "Where things stand" and suggests a commit |
| `/security-audit` | Before shipping features with auth, APIs or sensitive data | OWASP + auth + secrets + uploads checklist (summary; detail in `security.md`). Lists findings with Critical/High/Medium severity |
| `/deploy-checklist` | Before a merge to `main` or a production deploy | Full checklist: code, security, UI, SEO, documentation |
| `/tools-reference` | Initial setup or when you need to see which skills to use and when | Table of design skills + Context7 |

### How to ask: no need to say "skill"

- **Explicit:** type the command (`/grill`, `/new-feature`…). Works in Claude Code and
  Antigravity.
- **Automatic:** describe the task in your own words ("I want to plan this feature",
  "check security before shipping") and the agent activates the skill whose
  description matches. Rules (`security`, `seo`, `ui-ux`…) activate this way.
- **Force a specific one:** name it in the request ("use the `hallmark` skill for this
  landing page"). It keeps the agent from picking another.

### Typical task flow

```
/grill                  ← optional, if the plan is fuzzy: the AI questions you until it's sharp
/new-feature            ← you define the task, the branch is created and 02_TASKS.md is updated
  ... you work ...
/security-audit         ← if you touched auth, APIs or sensitive data
/deploy-checklist       ← if you're merging to main
/session-close          ← always at the end: updates docs and suggests the commit
```

`/bug-fix` replaces `/new-feature` when the starting point is something broken, not a
new feature; the rest of the flow (`/security-audit`, `/deploy-checklist`,
`/session-close`) applies the same way.

---

## Subagents

Both tools have file-declared subagents, in different formats that **are not converted
into each other** (ADR-006): Antigravity reads `agents/<name>/agent.md`, Claude Code
reads `agents/<name>.md`. Codex has no declarable subagents yet. The `/catalogo` page
shows each one with its content.

### Antigravity — 7 subagents

The main agent invokes them with `invoke_subagent` when the task calls for it (or you
pick them by hand from the `/agents` panel). They run in an isolated context: the
detail of their work doesn't pollute the main agent's window.

| Subagent | What it does | Writes code |
|---|---|---|
| `auditor` | Reviews the diff against the rules: correctness, architecture, conventions, data, reuse and UI | No — read-only |
| `backend` | Endpoints, services, data access, migrations. Verifies with tests/typecheck before returning | Yes |
| `frontend` | Components, pages, styles, the 5 UI states, accessibility | Yes |
| `security` | OWASP audit: auth, inputs, injection, secrets, uploads, CORS, privacy | No — read-only |
| `web-researcher` | Researches the web without leaking user data or obeying instructions that come from a page | No — web tools only |
| `server-inspector` | Diagnoses servers over SSH (logs, services, disk, containers) without changing anything | No — read-only |
| `server-operator` | Applies one-off changes on servers over SSH, each command with approval | No — changes servers |

They all run with `commandExecutionPolicy: sandbox`, except the two server agents, which
run with `off` (every command waits for your approval), and inherit the terminal
permissions you already configured. `auditor` and `security` have `run_command` for
inspection only (`git diff`, `npm audit`), with no file-writing tool. `web-researcher`
only has `search_web` and `read_url_content`. `security` and `server-operator` run on
the `pro` tier; the rest inherit the session model.

`web-researcher` exists in both tools (ADR-022). In Claude Code, a hook also reviews
every search and every URL before it goes out: it blocks secrets, emails, local paths
and local network hosts. To add project-specific terms (clients, internal names), list
them one per line in `.claude/web-guard-terms.txt`.

`server-inspector` and `server-operator` also exist in both tools (ADR-026). They only
connect through `~/.ssh/config` aliases, listed per project in `.claude/ssh-hosts.txt`
or `.agents/ssh-hosts.txt`; the operator won't connect without that list. **Don't put
`ssh`, `scp` or `rsync` in the command allow list**: changes would run without asking
for approval. In Claude Code a hook (`~/.claude/hooks/ssh-guard.mjs`) limits the
inspector to read-only commands, makes the operator ask for approval on every command
and blocks both from anything that would cut off access to the server; in Antigravity
those rules live in the prompt.

### Claude Code — 10 subagents

`planner`, `code-reviewer`, `ui-reviewer`, `security-auditor`, `db-migration-reviewer`,
`debugger`, `test-writer`, `web-researcher`, `server-inspector` and `server-operator`.

8 by default (ADR-027): what Claude Code or a kit command already covers has no
subagent of its own. For searching the code there's Claude Code's `Explore` agent;
`/session-close` closes the docs and the commit, and `/deploy-checklist` the deploy
check. Commands delegate to their agent: `/bug-fix` to `debugger` and `/security-audit`
to `security-auditor`.

---

## Skills

Packaged external knowledge: they complement `stack-conventions.md`, they don't
replace it.

| | `stack-conventions.md` | Skills |
|---|---|---|
| What it is | Your project rules | External community knowledge |
| Example | "we use Zod for validation" | "this is how you avoid waterfalls in React" |
| When it loads | Glob, when editing code | By the criteria in `tools-reference` |

### Design skills

| Skill | When to use it |
|---|---|
| `frontend-design` | Starting a new UI, with or without an existing design system |
| `impeccable` (polish) | Reviewing an existing UI or before a PR; `frontend-design` should have run first |
| `web-design-guidelines` | Auditing a11y, forms and performance against Vercel's Web Interface Guidelines |
| `vercel-react-best-practices` | Writing or reviewing React/Next.js components — 70 performance rules |
| `vercel-composition-patterns` | Refactoring components with many boolean props, designing reusable component APIs (shadcn/ui) |
| `ui-patterns` | Choosing or naming a UI pattern: animations, menus, modals, drawers, toasts, skeletons, empty states |

Never more than 2-3 active at once. The full detail, the precedence when they conflict
and how to install each one live in `/tools-reference`, not here, so the two copies
don't drift apart.

### Marketing/SEO skills

| Skill | When to use it |
|---|---|
| `seo-audit` | Auditing or diagnosing SEO problems: traffic drops, indexing, ranking. Diagnosis only: the concrete thresholds (Lighthouse, OG, meta tags) are defined by `seo.md`, not the skill |
| `ai-seo` | Getting the content cited by AI engines (AI Overviews, ChatGPT, Perplexity): AEO/GEO, `llms.txt` |

### Domain skill

| Skill | When to use it |
|---|---|
| `domain-modeling` | While working, not as a separate step: when a new or ambiguous domain term appears, or when naming entities, types and endpoints. It maintains the `docs/CONTEXT.md` glossary, which is business language, not a technical schema (that's `DATA_MODEL.md`) |

The glossary template is in `docs-templates/CONTEXT.md` and is created only when 3
terms justify it (ADR-012).

### Launch and security skills

| Skill | When to use it |
|---|---|
| `security-mitigations` | When implementing or auditing login, permissions, APIs, uploads, dependencies, AI or WordPress: an index leads to the relevant topic without reading everything |
| `prelaunch-compliance-audit` | Before launching a website or app (or with one already live): an audit against 43 legal, privacy, security, accessibility, technical and SEO rules. It researches the current regulations of the project's country, delivers a report by severity and proposes fixes it doesn't apply without approval. It also drafts privacy, terms, refunds, cookies and legal notice texts from the project's facts |
| `api-security-best-practices` | Designing or reviewing API endpoints: auth, input validation, rate limiting, protection against injection/SSRF/DDoS. Don't use it to pick the project's thresholds (that's `security.md`); use it for the implementation patterns (JWT, Zod, rate limiters, headers) |

`/deploy-checklist` recommends `prelaunch-compliance-audit` on the first launch. It
loads in parts: `SKILL.md` has the flow and the report format; the catalog, the
regulations by country and the legal texts live in `references/` and are read only when
a step needs them. It doesn't replace a lawyer or a penetration test.

### Third-party design skills

Unlike the ones in `.agents/skills/`, these do **not** ship in the global kit: they are
code from other repos, with their own license and their own update cycle.

| Source | Skills | Where they live |
|---|---|---|
| [nutlope/hallmark](https://github.com/nutlope/hallmark) | `hallmark` | The author's Claude account |
| [emilkowalski/skills](https://github.com/emilkowalski/skill) | `emil-design-eng`, `review-animations`, `improve-animations`, `find-animation-opportunities`, `animation-vocabulary`, `apple-design`, `pick-ui-library` | The author's Claude account |
| [ui-ux-pro-max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) | `ui-ux-pro-max`, `design-system`, `ui-styling` | Vendored in `.claude/skills/` |

To use them on another machine or account, install them as personal skills:

```bash
npx skills add nutlope/hallmark
npx skills add emilkowalski/skills
npx ui-ux-pro-max-cli init --ai claude
```

`skills-lock.json` only records `api-security-best-practices`. The three from `uipro
init` are **not** in the lock: the uipro CLI doesn't write it, so their only version
reference is this repo (git).

> `uipro init` also installs `design`, `brand`, `banner-design` and `slides`, a separate
> graphic design pack (logos, brand identity, social banners, presentations) that its
> README doesn't mention. They were removed by hand as out of scope for this repo: if
> you run `uipro init` again, they come back.

#### Uploading them to Claude Desktop

Claude Desktop takes them as personal skills in ZIP format. To build them:

```bash
python scripts/make-desktop-zips.py
```

It leaves one `.zip` per skill in `skills-desktop/` (gitignored), each with its
`SKILL.md` at the folder root. **Copying only the `SKILL.md` isn't enough** except for
single-file skills: `ui-ux-pro-max` is 39 files, and without its `data/` the skill
points to files that don't exist.

> `ui-ux-pro-max` works partially in Desktop: its `SKILL.md` calls
> `python3 skills/ui-ux-pro-max/scripts/search.py`, a project-relative path that doesn't
> exist there. The data CSVs are still read, but the automated design-system search
> doesn't run.

---

## Token usage (approximate)

Estimated as characters/4: not the real tokenizer, but a good order of magnitude. The
table is regenerated with `python scripts/update-token-table.py`; don't edit it by
hand.

<!-- token-table:start -->
| File | ~Tokens | When it loads |
|---|---|---|
| `GEMINI.md` | ~2,497 | Always |
| `security.md` | ~2,315 | Model Decision |
| `architecture.md` | ~1,572 | Model Decision |
| `ui-ux.md` | ~2,000 | Model Decision |
| `seo.md` | ~1,445 | Model Decision |
| `pwa.md` | ~578 | Model Decision — PWA only |
| `operations.md` | ~1,553 | Model Decision |
| `cms.md` | ~690 | Model Decision |
| `database.md` | ~873 | Model Decision |
| `stack-conventions.md` | ~874 | Glob |
| `/tools-reference` | ~1,267 | Skill — slash or by description |
| `/grill` | ~604 | Skill — slash or by description |
| `/new-feature` | ~440 | Skill — slash or by description |
| `/bug-fix` | ~405 | Skill — slash or by description |
| `/session-close` | ~488 | Skill — slash or by description |
| `/security-audit` | ~370 | Skill — slash or by description |
| `/deploy-checklist` | ~792 | Skill — slash or by description |
| **Always-on baseline** | **~2,497** | `GEMINI.md` |
| **Typical case** (1-2 rules + 1 workflow) | **~4,439–8,079** | regular coding session |
| **Maximum, everything active** | **~15,664** | unlikely — several rules almost never activate together |
<!-- token-table:end -->

The "maximum, everything active" is a theoretical ceiling (e.g. touching auth + UI +
infra + CMS in the same message), not the real case. In practice, a regular feature
task loads `GEMINI.md` + 1-2 relevant rules + the invoked workflow.

---

## Maintenance notes

- **`security.md` is the source of truth for security.** `/security-audit` and the
  security section of `/deploy-checklist` are summarized checklists that point to
  specific sections; if a security rule changes, check whether the workflow summaries
  went stale.
- **`architecture.md` has an explicit exception for the Next.js App Router**: Server
  Components/Actions may touch the data layer; Client Components may not. Don't apply
  the strict layer pattern to an App Router project without reading that exception
  first.
- **`operations.md` assumes self-hosted infrastructure** (Docker Compose + Cloudflare
  Tunnel) as the default case, not AWS/GCP; the cloud-provider Secret Manager rules are
  conditional, only if a specific project deploys there.
- Every file uses LF (not CRLF) and a non-empty `description` in its frontmatter; if
  you edit a file from Windows, make sure CRLF doesn't creep back in before committing.
