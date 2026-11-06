#!/usr/bin/env node
// Hook PreToolUse global: impide que los datos personales del usuario salgan del
// equipo (ADR-034). Se instala a mano por equipo, no viaja con ningún kit.
//
// Los datos viven fuera de los repos, uno por línea, en ~/.claude/personal-data.txt.
// Sin ese archivo el hook no protege nada y lo avisa en la sesión.
//
// Qué hace con cada herramienta, siempre que el texto contenga uno de los datos:
// - Búsquedas y lectura web: bloquea.
// - Bash y PowerShell: bloquea si el comando habla con la red.
// - Write, Edit y NotebookEdit: bloquea si la línea identifica a un cliente
//   automatizado (User-Agent, mailto, contacto). Es el caso de un script que se
//   escribe ahora y se ejecuta después, cuando el hook ya no ve el dato.
// - Otras herramientas MCP: pregunta, porque enviarse un correo a uno mismo es legítimo.
//
// No es una barrera total: no reconoce un dato codificado (base64) ni uno que un
// script lea de otro archivo. La regla de § 2 del núcleo cubre el resto.
//
// Instalación en ~/.claude/settings.json:
//   "hooks": { "PreToolUse": [{
//     "matcher": "Bash|PowerShell|WebFetch|WebSearch|Write|Edit|NotebookEdit|mcp__.*",
//     "hooks": [{ "type": "command",
//       "command": "node \"$HOME/.claude/hooks/personal-data-guard.mjs\" || exit 2" }]
//   }]}
//
// El `|| exit 2` hace que falle cerrado si el hook no arranca.
import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const TERMS_FILE = process.env.PERSONAL_DATA_FILE || join(homedir(), ".claude", "personal-data.txt");

/** Comandos y librerías que envían datos fuera del equipo. */
const NETWORK =
  /\b(?:curl|wget|Invoke-WebRequest|Invoke-RestMethod|iwr|irm|ssh|scp|sftp|rsync|telnet|ftp)\b|\bgh\s+(?:api|pr|issue|release|gist)\b|\bfetch\s*\(|\b(?:requests|httpx|urllib|axios|aiohttp|undici)\b|\bhttps?\.(?:get|request)\b|user[-_ ]?agent/i;

/** Marcas de que una línea identifica a un cliente automatizado ante un sitio. */
const CLIENT_IDENTITY = /user[-_ ]?agent|\b(?:UA|BOT)\b|mailto:|\bcontact\b/i;

const WEB_TOOL = /^(?:WebFetch|WebSearch)$|firecrawl/i;
const SHELL_TOOL = /^(?:Bash|PowerShell)$/;
const WRITE_TOOLS = { Write: "content", Edit: "new_string", NotebookEdit: "new_source" };

function loadTerms() {
  const raw = readFileSync(TERMS_FILE, "utf8");
  return raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length >= 3 && !line.startsWith("#"))
    .map((line) => line.toLowerCase());
}

/** Normaliza lo que cambia al viajar en una URL: mayúsculas y la arroba codificada. */
function normalize(text) {
  return String(text ?? "").replace(/%40/gi, "@").toLowerCase();
}

function hasTerm(text, terms) {
  const normalized = normalize(text);
  return terms.some((term) => normalized.includes(term));
}

function decide({ tool_name: tool = "", tool_input: input = {} }, terms) {
  if (tool in WRITE_TOOLS) {
    const lines = String(input[WRITE_TOOLS[tool]] ?? "").split(/\r?\n/);
    const leaks = lines.some((line) => CLIENT_IDENTITY.test(line) && hasTerm(line, terms));
    return leaks ? ["deny", "el archivo identificaría a un cliente automatizado con tus datos personales"] : null;
  }
  if (SHELL_TOOL.test(tool)) {
    const command = String(input.command ?? "");
    return NETWORK.test(command) && hasTerm(command, terms)
      ? ["deny", "el comando enviaría tus datos personales por la red"]
      : null;
  }
  const isWeb = WEB_TOOL.test(tool);
  if (!isWeb && !tool.startsWith("mcp__")) return null;
  if (!hasTerm(JSON.stringify(input), terms)) return null;
  return isWeb
    ? ["deny", "la consulta o la URL lleva tus datos personales"]
    : ["ask", "esta herramienta externa recibiría tus datos personales"];
}

function main() {
  let payload;
  try {
    payload = JSON.parse(readFileSync(0, "utf8"));
  } catch {
    process.stderr.write("personal-data-guard: entrada inválida, se bloquea por seguridad.\n");
    process.exit(2);
  }

  let terms;
  try {
    terms = loadTerms();
  } catch {
    console.log(JSON.stringify({ systemMessage: `personal-data-guard: falta ${TERMS_FILE}, tus datos no están protegidos.` }));
    return;
  }

  const verdict = decide(payload, terms);
  if (!verdict) return;
  const [action, reason] = verdict;
  if (action === "deny") {
    process.stderr.write(`Bloqueado: ${reason}. Usá un nombre genérico o pedile al usuario que lo haga.\n`);
    process.exit(2);
  }
  console.log(
    JSON.stringify({
      hookSpecificOutput: { hookEventName: "PreToolUse", permissionDecision: "ask", permissionDecisionReason: reason },
    }),
  );
}

main();
