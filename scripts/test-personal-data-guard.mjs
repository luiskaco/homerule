#!/usr/bin/env node
// Casos del hook personal-data-guard. Usa un dato falso, nunca uno real.
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const HOOK = fileURLToPath(new URL("../.claude/hooks/personal-data-guard.mjs", import.meta.url));
const DIR = mkdtempSync(join(tmpdir(), "personal-data-guard-"));
const TERMS = join(DIR, "personal-data.txt");
writeFileSync(TERMS, "# datos de prueba\npersona@example.com\r\n");

const MAIL = "persona@example.com";
const bash = (command) => ({ tool_name: "Bash", tool_input: { command } });
const ps = (command) => ({ tool_name: "PowerShell", tool_input: { command } });
const write = (content) => ({ tool_name: "Write", tool_input: { file_path: "a.mjs", content } });
const edit = (new_string) => ({ tool_name: "Edit", tool_input: { file_path: "a.mjs", old_string: "x", new_string } });

const CASES = [
  ["allow", bash(`git config user.email ${MAIL}`)],
  ["allow", bash(`grep -rn ${MAIL} src`)],
  ["allow", bash("curl -A 'cliente-generico/1.0' https://example.org")],
  ["allow", write(`export const author = "${MAIL}";`)],
  ["allow", write("const UA = 'cliente-generico/1.0';")],
  ["allow", { tool_name: "WebSearch", tool_input: { query: "node 24 release notes" } }],
  ["allow", { tool_name: "Read", tool_input: { file_path: MAIL } }],
  ["allow", { tool_name: "mcp__docs__query", tool_input: { q: "prisma migrate" } }],
  ["deny", bash(`curl -A 'sonda/0.1 (+${MAIL})' https://example.org`)],
  ["deny", bash(`node -e "fetch('https://example.org',{headers:{'User-Agent':'x ${MAIL}'}})"`)],
  ["deny", bash(`curl https://example.org?c=persona%40example.com`)],
  ["deny", bash(`gh pr create --body "contacto ${MAIL.toUpperCase()}"`)],
  ["deny", ps(`Invoke-WebRequest https://example.org -UserAgent '${MAIL}'`)],
  ["deny", write(`const UA='sonda/0.1 (+${MAIL})';`)],
  ["deny", write(`const ok = 1;\nconst BOT = '${MAIL}';`)],
  ["deny", edit(`headers: { "User-Agent": "${MAIL}" }`)],
  ["deny", { tool_name: "WebSearch", tool_input: { query: `quien es ${MAIL}` } }],
  ["deny", { tool_name: "WebFetch", tool_input: { url: `https://example.org?e=${MAIL}`, prompt: "leer" } }],
  ["deny", { tool_name: "mcp__abc__firecrawl_scrape", tool_input: { url: `https://example.org/${MAIL}` } }],
  ["ask", { tool_name: "mcp__gmail__create_draft", tool_input: { to: MAIL } }],
];

function run(payload, termsFile = TERMS, raw) {
  const res = spawnSync(process.execPath, [HOOK], {
    input: raw ?? JSON.stringify(payload),
    encoding: "utf8",
    env: { ...process.env, PERSONAL_DATA_FILE: termsFile },
  });
  if (res.status === 2) return "deny";
  if (res.stdout.includes('"permissionDecision":"ask"')) return "ask";
  return res.status === 0 ? "allow" : `exit ${res.status}`;
}

let failed = 0;
const check = (name, expected, actual) => {
  if (expected === actual) return;
  failed++;
  console.error(`FALLA ${name}: se esperaba ${expected}, salió ${actual}`);
};

for (const [expected, payload] of CASES) check(JSON.stringify(payload).slice(0, 90), expected, run(payload));
check("entrada inválida", "deny", run(null, TERMS, "no es json"));
check("sin archivo de datos", "allow", run(bash(`curl ${MAIL}`), join(DIR, "no-existe.txt")));

rmSync(DIR, { recursive: true, force: true });
const total = CASES.length + 2;
console.log(failed ? `${failed} de ${total} casos fallaron` : `${total} casos OK`);
process.exit(failed ? 1 : 0);
