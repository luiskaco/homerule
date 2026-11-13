#!/usr/bin/env node
// Freno de secretos al commitear (ADR-041). Lo llama el hook `pre-commit` de esta
// carpeta, que git usa en todos los repos del equipo por `core.hooksPath` global.
// Así cubre a Claude, Antigravity, Codex y los commits a mano por igual.
//
// Revisa solo lo que entra en el commit (las líneas agregadas del área de
// preparación), no el historial. Bloquea dos cosas:
// - Archivos que nunca se versionan: `.env` reales, `wp-config.php`, llaves
//   privadas (`.pem`, `.p12`, `id_rsa`…).
// - Líneas con una clave privada o un token con formato conocido.
//
// Nunca imprime el secreto: muestra archivo, línea y tipo.
// Una línea que es a propósito (un ejemplo, un test) se marca con el comentario
// `secret-scan: allow`. Saltar el hook entero (`--no-verify`) es decisión del usuario.
import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";

/** Archivos que no se commitean nunca, por nombre (sin la carpeta). */
const FORBIDDEN_FILES = [
  { re: /^\.env(?:\..+)?$/i, unless: /\.(?:example|sample|template|dist)$/i, kind: "archivo .env" },
  { re: /^wp-config\.php$/i, kind: "wp-config.php" },
  { re: /\.(?:pem|p12|pfx|jks|keystore)$/i, kind: "llave o certificado" },
  { re: /^id_(?:rsa|dsa|ecdsa|ed25519)$/i, kind: "llave SSH privada" },
];

/** Patrones de alta certeza: formatos de proveedores, no "parece una clave". */
const SECRET_PATTERNS = [
  { re: /-----BEGIN (?:[A-Z]+ )?PRIVATE KEY(?: BLOCK)?-----/, kind: "clave privada" },
  { re: /\b(?:AKIA|ASIA)[0-9A-Z]{16}\b/, kind: "clave de AWS" },
  { re: /\bAIza[0-9A-Za-z_-]{35}\b/, kind: "clave de API de Google" },
  { re: /\bgh[pousr]_[A-Za-z0-9]{36,}\b|\bgithub_pat_[A-Za-z0-9_]{22,}\b/, kind: "token de GitHub" },
  { re: /\bglpat-[A-Za-z0-9_-]{20,}\b/, kind: "token de GitLab" },
  { re: /\bxox[abprs]-[A-Za-z0-9-]{10,}/, kind: "token de Slack" },
  { re: /\b[rs]k_live_[A-Za-z0-9]{20,}\b/, kind: "clave live de Stripe" },
  { re: /\bsk-(?:ant|proj)-[A-Za-z0-9_-]{20,}/, kind: "clave de API de IA" },
  { re: /\bSG\.[A-Za-z0-9_-]{22}\.[A-Za-z0-9_-]{43}\b/, kind: "clave de SendGrid" },
  { re: /\bnpm_[A-Za-z0-9]{36}\b/, kind: "token de npm" },
];

const ALLOW = /secret-scan:\s*allow/i;

/** Analiza un diff unificado (`git diff --cached -U0`). Devuelve los hallazgos. */
export function scanDiff(diff) {
  const findings = [];
  let file = null;
  let line = 0;
  for (const raw of diff.split("\n")) {
    if (raw.startsWith("+++ ")) {
      file = raw === "+++ /dev/null" ? null : raw.slice(4).replace(/^b\//, "");
      continue;
    }
    const hunk = raw.match(/^@@ -\d+(?:,\d+)? \+(\d+)/);
    if (hunk) {
      line = Number(hunk[1]);
      continue;
    }
    if (!file || !raw.startsWith("+")) continue;
    const text = raw.slice(1);
    if (!ALLOW.test(text)) {
      for (const { re, kind } of SECRET_PATTERNS) {
        if (re.test(text)) {
          findings.push({ file, line, kind });
          break;
        }
      }
    }
    line++;
  }
  return findings;
}

/** Revisa los nombres de los archivos agregados o modificados. */
export function scanFiles(paths) {
  const findings = [];
  for (const path of paths) {
    const name = path.split("/").pop();
    const hit = FORBIDDEN_FILES.find(({ re, unless }) => re.test(name) && !unless?.test(name));
    if (hit) findings.push({ file: path, line: null, kind: hit.kind });
  }
  return findings;
}

function git(args) {
  return execFileSync("git", args, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
}

function main() {
  const paths = git(["diff", "--cached", "--name-only", "--diff-filter=ACMR", "-z"]).split("\0").filter(Boolean);
  if (paths.length === 0) return 0;
  const diff = git(["diff", "--cached", "-U0", "--no-color", "--no-ext-diff", "--diff-filter=ACMR"]);
  const findings = [...scanFiles(paths), ...scanDiff(diff)];
  if (findings.length === 0) return 0;

  console.error("\n✋ Commit frenado: hay secretos en lo que vas a commitear.\n");
  for (const f of findings) console.error(`  ${f.file}${f.line ? `:${f.line}` : ""} — ${f.kind}`);
  console.error(
    [
      "",
      "Qué hacer:",
      "  - Sacar el archivo del commit: git restore --staged <archivo> (y sumarlo a .gitignore).",
      "  - Mover el secreto a una variable de entorno o a un archivo ignorado.",
      "  - Si una clave real ya se subió alguna vez, revocarla: borrarla del repo no alcanza.",
      "  - Si la línea es un ejemplo a propósito, marcarla con el comentario: secret-scan: allow",
      "",
    ].join("\n"),
  );
  return 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exit(main());
}
