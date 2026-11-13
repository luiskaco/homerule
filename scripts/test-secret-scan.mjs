// Casos del freno de secretos al commitear (git-hooks/secret-scan.mjs, ADR-041).
// Los secretos de prueba se arman por partes para que este archivo no frene su
// propio commit.
import { scanDiff, scanFiles } from "../git-hooks/secret-scan.mjs";

const fake = {
  privateKey: "-----BEGIN " + "PRIVATE KEY-----",
  rsaKey: "-----BEGIN RSA " + "PRIVATE KEY-----",
  aws: "AKIA" + "ABCDEFGHIJKLMNOP",
  google: "AIza" + "x".repeat(35),
  github: "ghp_" + "a".repeat(36),
  stripeLive: "sk_live_" + "a".repeat(24),
  stripeTest: "sk_test_" + "a".repeat(24),
  anthropic: "sk-ant-" + "a".repeat(30),
};

function diffFor(file, ...lines) {
  return [`diff --git a/${file} b/${file}`, `--- a/${file}`, `+++ b/${file}`, `@@ -0,0 +1,${lines.length} @@`, ...lines.map((l) => `+${l}`)].join("\n");
}

const diffCases = [
  ["clave privada de Google en PHP", diffFor("inc/key.php", "<?php", `'private_key' => "${fake.privateKey}\\nMIIE...",`), 1],
  ["clave RSA", diffFor("deploy/key.txt", fake.rsaKey), 1],
  ["clave de AWS", diffFor("config.js", `const id = "${fake.aws}";`), 1],
  ["clave de Google", diffFor("maps.js", `key: "${fake.google}"`), 1],
  ["token de GitHub", diffFor("ci.sh", `TOKEN=${fake.github}`), 1],
  ["Stripe live", diffFor("pay.ts", `stripe("${fake.stripeLive}")`), 1],
  ["Stripe test pasa", diffFor("pay.test.ts", `stripe("${fake.stripeTest}")`), 0],
  ["clave de Anthropic", diffFor("ai.py", `api_key="${fake.anthropic}"`), 1],
  ["línea marcada como ejemplo pasa", diffFor("README.md", `${fake.aws} <!-- secret-scan: allow -->`), 0],
  ["texto normal pasa", diffFor("README.md", "Usá una PRIVATE KEY guardada fuera del repo.", "process.env.STRIPE_KEY"), 0],
  ["línea borrada no cuenta", [`--- a/old.js`, `+++ b/old.js`, `@@ -1 +0,0 @@`, `-${fake.aws}`].join("\n"), 0],
];

const fileCases = [
  [".env", 1],
  ["app/.env.local", 1],
  [".env.production", 1],
  [".env.example", 0],
  [".env.production.example", 0],
  ["wp-config.php", 1],
  ["wp-config-sample.php", 0],
  ["certs/server.pem", 1],
  ["id_ed25519", 1],
  ["id_ed25519.pub", 0],
  ["src/env.ts", 0],
];

let failed = 0;
function check(name, got, want) {
  const ok = got === want;
  if (!ok) failed++;
  console.log(`${ok ? "ok  " : "FAIL"} ${name} (esperado ${want}, dio ${got})`);
}

for (const [name, diff, want] of diffCases) check(name, scanDiff(diff).length, want);
for (const [path, want] of fileCases) check(`archivo ${path}`, scanFiles([path]).length, want);

// El número de línea apunta a la línea del archivo nuevo.
const [hit] = scanDiff(diffFor("a.js", "uno", "dos", `x = "${fake.aws}"`));
check("número de línea", hit?.line, 3);

console.log(failed ? `\n${failed} caso(s) fallaron` : "\nTodos los casos pasan");
process.exit(failed ? 1 : 0);
