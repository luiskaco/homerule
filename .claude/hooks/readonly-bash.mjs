#!/usr/bin/env node
// Hook PreToolUse de los subagents de solo lectura (ADR-021).
//
// Claude Code le pasa por stdin el JSON de la llamada a Bash. Si el comando no
// es de lectura, sale con código 2 y el motivo en stderr: Claude Code cancela
// la llamada y le devuelve el motivo al subagent. Cualquier cosa que no se
// reconoce se bloquea — un falso positivo se arregla sumando el comando acá.
//
// Se activa desde el frontmatter del agente:
//   hooks:
//     PreToolUse:
//       - matcher: "Bash"
//         hooks:
//           - type: command
//             command: 'node "$CLAUDE_PROJECT_DIR/.claude/hooks/readonly-bash.mjs" || exit 2'
//
// El `|| exit 2` hace que falle cerrado: si el hook no arranca (sin Node, ruta
// mal resuelta), Claude Code recibe exit 2 y bloquea en vez de dejar pasar.
import { readFileSync } from "node:fs";

class Denied extends Error {}

/** Comandos de lectura sin chequeo de argumentos (no escriben ni ejecutan otros). */
const PLAIN = new Set([
  "ls", "cat", "head", "tail", "wc", "grep", "egrep", "fgrep", "uniq", "cut",
  "tr", "diff", "file", "stat", "du", "df", "pwd", "echo", "printf", "which",
  "jq", "basename", "dirname", "realpath", "cd", "true",
]);

/** Subcomandos de git que solo leen. */
const GIT_READ = new Set([
  "status", "diff", "log", "show", "blame", "rev-parse", "ls-files", "ls-tree",
  "grep", "describe", "shortlog", "merge-base", "cat-file", "rev-list",
  "show-ref", "for-each-ref",
]);

const GIT_BRANCH_READ_FLAGS = new Set([
  "--show-current", "-a", "--all", "-r", "--remotes", "-v", "-vv", "--list",
  "--merged", "--no-merged", "--contains",
]);

function deny(reason) {
  return new Denied(reason);
}

/**
 * Parte el comando en segmentos (separados por `&&`, `||`, `;`, `|`, `&` o salto
 * de línea) y cada segmento en palabras, respetando comillas. Rechaza lo que
 * puede ejecutar o escribir sin aparecer como comando: sustitución de comandos,
 * process substitution y redirecciones que no van a /dev/null.
 */
function parse(cmd) {
  const segments = [[]];
  let word = "";
  let inWord = false;
  let quote = null;

  const pushWord = () => {
    if (inWord) segments[segments.length - 1].push(word);
    word = "";
    inWord = false;
  };
  const newSegment = () => {
    pushWord();
    segments.push([]);
  };

  for (let i = 0; i < cmd.length; i++) {
    const c = cmd[i];
    const n = cmd[i + 1];

    if (quote === "'") {
      if (c === "'") quote = null;
      else word += c;
      continue;
    }
    if (c === "\\" && n !== undefined) {
      word += n;
      inWord = true;
      i++;
      continue;
    }
    if (c === "`" || (c === "$" && n === "(")) throw deny("sustitución de comandos");
    if (quote === '"') {
      if (c === '"') quote = null;
      else word += c;
      continue;
    }
    if (c === "'" || c === '"') {
      quote = c;
      inWord = true;
      continue;
    }
    if ((c === "<" || c === ">") && n === "(") throw deny("process substitution");

    if (c === ">" || (c === "&" && n === ">")) {
      // Un descriptor pegado al `>` (`2>`) no es una palabra del comando.
      if (/^\d+$/.test(word)) {
        word = "";
        inWord = false;
      }
      pushWord();
      let j = c === "&" ? i + 2 : i + 1;
      if (cmd[j] === ">") j++;
      if (cmd[j] === "&" && /\d/.test(cmd[j + 1] ?? "")) {
        i = j + 1; // `2>&1`: duplica un descriptor, no escribe archivos
        continue;
      }
      while (cmd[j] === " " || cmd[j] === "\t") j++;
      let target = "";
      while (j < cmd.length && !/[\s;&|<>]/.test(cmd[j])) target += cmd[j++];
      if (target !== "/dev/null") throw deny(`redirección que escribe a "${target || "?"}"`);
      i = j - 1;
      continue;
    }

    if (c === "|" || c === ";" || c === "\n" || c === "&") {
      if ((c === "|" || c === "&") && n === c) i++;
      newSegment();
      continue;
    }
    if (c === " " || c === "\t" || c === "\r") {
      pushWord();
      continue;
    }
    word += c;
    inWord = true;
  }

  if (quote) throw deny("comillas sin cerrar");
  pushWord();
  return segments.filter((s) => s.length > 0);
}

function checkGit(args) {
  // Opciones globales antes del subcomando. `-c` queda afuera: puede setear un
  // pager o un hook que ejecute cualquier cosa.
  let k = 0;
  while (k < args.length && args[k].startsWith("-")) {
    if (args[k] === "--no-pager") k++;
    else if (args[k] === "-C") k += 2;
    else throw deny(`opción global de git no permitida: ${args[k]}`);
  }
  const sub = args[k];
  const rest = args.slice(k + 1);
  if (!sub) throw deny("git sin subcomando");
  if (rest.some((a) => a.startsWith("--output") || a === "-O" || a.startsWith("--open-files-in-pager"))) {
    throw deny(`git ${sub} con salida a archivo o pager externo`);
  }
  if (GIT_READ.has(sub)) return;
  if (sub === "branch" && rest.every((a) => GIT_BRANCH_READ_FLAGS.has(a))) return;
  if (sub === "stash" && rest[0] === "list") return;
  if (sub === "remote" && (rest.length === 0 || (rest.length === 1 && rest[0] === "-v"))) return;
  if (sub === "config" && rest.length > 0 && ["--get", "--get-all", "--list", "-l"].includes(rest[0])) return;
  throw deny(`git ${sub} puede modificar el repo`);
}

const PACKAGE_READ = {
  npm: ["audit", "ls", "list", "outdated", "view", "--version", "-v"],
  pnpm: ["audit", "ls", "list", "outdated", "--version"],
  yarn: ["audit", "list", "outdated", "--version"],
  pip: ["list", "show", "--version"],
  pip3: ["list", "show", "--version"],
  composer: ["audit", "show", "outdated", "--version"],
};

function checkSegment(words) {
  const [name, ...args] = words;
  if (name.includes("/") || name.includes("\\")) throw deny(`ejecutar "${name}" por ruta`);
  if (name.includes("=")) throw deny("asignación de variable antes del comando");

  if (PLAIN.has(name)) return;
  if (name === "git") return checkGit(args);
  if (name === "find") {
    const bad = args.find((a) => /^-(delete|exec|execdir|ok|okdir|fprint|fprint0|fprintf|fls)$/.test(a));
    if (bad) throw deny(`find ${bad} modifica o ejecuta`);
    return;
  }
  if (name === "rg") {
    if (args.some((a) => a.startsWith("--pre"))) throw deny("rg --pre ejecuta un programa");
    return;
  }
  if (name === "sort" || name === "tree") {
    if (args.some((a) => a === "-o" || a.startsWith("--output"))) throw deny(`${name} -o escribe un archivo`);
    return;
  }
  if (name in PACKAGE_READ) {
    const sub = args[0];
    if (!PACKAGE_READ[name].includes(sub)) throw deny(`${name} ${sub ?? ""} no es de lectura`.trim());
    if (args.includes("fix") || args.includes("--fix")) throw deny(`${name} ${sub} fix modifica dependencias`);
    return;
  }
  if (name === "pip-audit" && !args.includes("--fix")) return;
  if ((name === "node" || name === "python" || name === "python3") && args.length === 1 && ["--version", "-V", "-v"].includes(args[0])) {
    return;
  }
  throw deny(`"${name}" no está en la lista de comandos de lectura`);
}

function check(command) {
  for (const segment of parse(command)) checkSegment(segment);
}

function main() {
  let command;
  try {
    command = JSON.parse(readFileSync(0, "utf8"))?.tool_input?.command;
  } catch {
    process.stderr.write("readonly-bash: no se pudo leer la llamada; se bloquea por seguridad.\n");
    process.exit(2);
  }
  if (typeof command !== "string" || command.trim() === "") process.exit(0);

  try {
    check(command);
  } catch (err) {
    if (!(err instanceof Denied)) throw err;
    process.stderr.write(
      `Bloqueado: ${err.message}. Este subagent es de solo lectura (ADR-021): ` +
        "usá Read/Grep/Glob o un comando de lectura. Si el comando sí es de lectura y falta en la " +
        "lista, reportalo al agente principal en vez de buscarle la vuelta.\n"
    );
    process.exit(2);
  }
  process.exit(0);
}

main();
