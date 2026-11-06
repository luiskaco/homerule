// Hook PostToolUse (Edit|Write): al editar un archivo de código, inyecta un
// recordatorio de aplicar stack-conventions — replica en Claude Code el
// trigger `glob` que Antigravity tiene nativo. Se emite una sola vez por
// sesión para no repetir el mismo recordatorio en cada edición.
import { existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

const EXTENSIONS = /\.(tsx|ts|jsx|js|vue|py|php|css)$/i;

let raw = "";
for await (const chunk of process.stdin) raw += chunk;

let input;
try {
  input = JSON.parse(raw);
} catch {
  process.exit(0);
}

const filePath = input?.tool_input?.file_path || "";
if (!EXTENSIONS.test(filePath)) process.exit(0);

// Una vez por sesión: marcador en tmp con el session_id.
const marker = join(tmpdir(), `claude-stack-conv-${input.session_id || "nosession"}`);
if (existsSync(marker)) process.exit(0);
try {
  writeFileSync(marker, "");
} catch {
  // sin marcador, el recordatorio se repite — preferible a fallar
}

const rulePath = existsSync(".agents/rules/stack-conventions.md")
  ? ".agents/rules/stack-conventions.md"
  : ".claude/skills/stack-conventions/SKILL.md";

console.log(
  JSON.stringify({
    hookSpecificOutput: {
      hookEventName: "PostToolUse",
      additionalContext: `Editaste un archivo de código: aplicá las convenciones de stack del proyecto (${rulePath}) — naming, patrones por framework y prohibiciones. Leela ahora si no la leíste en esta sesión.`,
    },
  })
);
