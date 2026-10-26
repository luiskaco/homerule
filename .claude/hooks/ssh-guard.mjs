#!/usr/bin/env node
// Hook PreToolUse de server-inspector y server-operator (ADR-026).
//
// Claude Code le pasa por stdin el JSON de la llamada a Bash. Revisa cada
// `ssh`, `scp` y `rsync` del comando; el resto de los segmentos tiene que ser de
// lectura local, con las mismas reglas que readonly-bash (shell-parse.mjs).
//
//   --inspect  el comando remoto tiene que ser de lectura. Si no, exit 2.
//   --operate  cada ssh/scp/rsync válido devuelve "ask": el usuario aprueba cada
//              cambio viendo alias y comando. Bloquea con exit 2 en
//              bypassPermissions/dontAsk (ahí el prompt no está garantizado) y
//              lo que deja sin acceso al servidor, aunque se apruebe.
//
// Común a los dos: solo alias declarados en ~/.ssh/config (sin comodines) y,
// si existe, listados en `.claude/ssh-hosts.txt` — obligatorio para operate.
// Opciones de ssh limitadas a -T, -q, -o BatchMode=yes y -o ConnectTimeout=<n>.
// Nada entra a ssh por stdin, nada se expande en la shell local, nada que no
// termine (-f/--follow) y nada que imprima secretos.
//
// Se activa desde el frontmatter del agente:
//   hooks:
//     PreToolUse:
//       - matcher: "Bash"
//         hooks:
//           - type: command
//             command: 'node "$CLAUDE_PROJECT_DIR/.claude/hooks/ssh-guard.mjs" --inspect || exit 2'
//
// El `|| exit 2` hace que falle cerrado: si el hook no arranca (sin Node, ruta
// mal resuelta, shell-parse.mjs faltante), Claude Code recibe exit 2 y bloquea.
import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { isAbsolute, join, relative, resolve } from "node:path";
import { Denied, deny, parseCommand, checkReadonlySegment } from "./shell-parse.mjs";

const MODE = process.argv.includes("--operate") ? "operate" : process.argv.includes("--inspect") ? "inspect" : null;

// ------------------------------------------------------------
// Alias: ~/.ssh/config y la lista del proyecto
// ------------------------------------------------------------

/** `Host` sin comodines declarados en ~/.ssh/config, siguiendo `Include` con rutas literales. */
function loadSshAliases() {
  const sshDir = join(homedir(), ".ssh");
  const aliases = new Set();
  const seen = new Set();

  const read = (file, depth) => {
    if (depth > 5 || seen.has(file) || !existsSync(file)) return;
    seen.add(file);
    let raw;
    try {
      raw = readFileSync(file, "utf8");
    } catch {
      return;
    }
    for (const line of raw.split(/\r?\n/)) {
      const m = line.trim().match(/^([A-Za-z]+)(?:\s*=\s*|\s+)(.+)$/);
      if (!m || line.trim().startsWith("#")) continue;
      const key = m[1].toLowerCase();
      const values = m[2]
        .replace(/\s+#.*$/, "")
        .split(/\s+/)
        .map((v) => v.replace(/^"|"$/g, ""));
      if (key === "host") {
        for (const v of values) if (v && !/[*?!]/.test(v)) aliases.add(v);
      } else if (key === "include") {
        for (const v of values) {
          if (/[*?[]/.test(v)) continue; // Include con comodines: no se sigue (falso positivo asumido)
          const p = v.startsWith("~") ? join(homedir(), v.slice(1)) : isAbsolute(v) ? v : join(sshDir, v);
          read(p, depth + 1);
        }
      }
    }
  };

  read(join(sshDir, "config"), 0);
  return aliases;
}

/** Alias permitidos en este proyecto, o null si no hay lista. */
function loadHostList(projectDir) {
  const file = join(projectDir, ".claude", "ssh-hosts.txt");
  if (!existsSync(file)) return null;
  const hosts = new Set();
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    const host = line.replace(/#.*/, "").trim();
    if (host) hosts.add(host);
  }
  return hosts;
}

function checkAlias(host, ctx) {
  if (!host) throw deny("falta el alias del servidor");
  if (/[@:/\\]/.test(host) || host.startsWith("-")) {
    throw deny(`"${host}" no es un alias: conectate solo con un Host de ~/.ssh/config, sin user@host ni IPs`);
  }
  if (!ctx.aliases.has(host)) throw deny(`"${host}" no es un Host declarado en ~/.ssh/config (sin comodines)`);
  if (ctx.mode === "operate" && ctx.hostList === null) {
    throw deny("falta .claude/ssh-hosts.txt con los alias en los que server-operator puede hacer cambios (uno por línea)");
  }
  if (ctx.hostList && !ctx.hostList.has(host)) throw deny(`"${host}" no está en .claude/ssh-hosts.txt`);
}

// ------------------------------------------------------------
// ssh, scp y rsync (nivel local)
// ------------------------------------------------------------

function checkSshOption(value) {
  const m = (value ?? "").match(/^\s*([A-Za-z]+)\s*[= ]\s*(\S+)\s*$/);
  const key = m?.[1].toLowerCase();
  if (key === "batchmode" && m[2].toLowerCase() === "yes") return;
  if (key === "connecttimeout" && /^\d+$/.test(m[2])) return;
  throw deny(`opción de ssh no permitida: -o ${value ?? ""} (solo BatchMode=yes y ConnectTimeout=<n>)`.trim());
}

/** Lo que vale para cualquier ssh/scp/rsync antes de mirar sus argumentos. */
function checkRemoteSegmentShape(seg, name) {
  if (seg.op === "|") throw deny(`nada puede entrar a ${name} por un pipe: mandaría datos o un script al servidor`);
  if (seg.stdin) throw deny(`redirección de entrada a ${name}: mandaría un archivo local al servidor`);
  if (seg.expands) throw deny(`${name} con $… sin comillas simples: se expandiría en tu máquina, no en el servidor`);
  if (seg.globs) throw deny(`${name} con *, ? o [ sin comillas: se expandiría en tu máquina, no en el servidor`);
}

function checkSsh(seg, ctx) {
  checkRemoteSegmentShape(seg, "ssh");
  const args = seg.words.slice(1);
  let i = 0;

  // OpenSSH vuelve a leer opciones después del host, así que se validan en los dos lados.
  const readOptions = () => {
    while (i < args.length && args[i].startsWith("-")) {
      const a = args[i];
      if (a === "--") {
        i++;
        return true;
      }
      if (a === "-o") {
        checkSshOption(args[i + 1]);
        i += 2;
      } else if (a.startsWith("-o")) {
        checkSshOption(a.slice(2));
        i++;
      } else if (/^-[Tq]+$/.test(a)) {
        i++;
      } else {
        throw deny(`opción de ssh no permitida: ${a} (solo -T, -q, -o BatchMode=yes y -o ConnectTimeout=<n>)`);
      }
    }
    return false;
  };

  const ended = readOptions();
  const host = args[i++];
  checkAlias(host, ctx);
  if (!ended) readOptions();

  // ssh une con espacios los argumentos que siguen al host y la shell remota los vuelve a parsear.
  const remote = args.slice(i).join(" ");
  if (!remote.trim()) throw deny("ssh sin comando remoto: abriría una shell interactiva");
  if (ctx.mode === "inspect") checkRemoteRead(remote);
  else checkRemoteOperate(remote);
  return { alias: host, detail: remote };
}

const SCP_FLAGS = /^-[qrpC]+$/;
const RSYNC_SHORT = /^-[avzrlptgoDhPnciHAXSuqm]+$/;
const RSYNC_LONG = new Set([
  "--archive", "--verbose", "--compress", "--recursive", "--links", "--perms", "--times",
  "--group", "--owner", "--devices", "--specials", "--human-readable", "--progress",
  "--partial", "--dry-run", "--checksum", "--itemize-changes", "--stats", "--delete",
  "--delete-after", "--delete-before", "--delete-during", "--update", "--no-perms",
  "--no-owner", "--no-group",
]);
const RSYNC_LONG_VALUE = /^--(exclude|include|chmod|chown)=/;

/** scp/rsync: solo server-operator, solo de subida, desde el proyecto hacia `<alias>:`. */
function checkCopy(seg, ctx) {
  const name = seg.words[0];
  if (ctx.mode === "inspect") {
    throw deny(`${name}: server-inspector no copia archivos; leé con ssh <alias> 'cat …'`);
  }
  checkRemoteSegmentShape(seg, name);
  if (ctx.hasCd) throw deny(`no combines cd con ${name}: la ruta local se resuelve contra el directorio del proyecto`);

  const operands = [];
  for (const a of seg.words.slice(1)) {
    if (!a.startsWith("-")) operands.push(a);
    else if (name === "scp" && SCP_FLAGS.test(a)) continue;
    else if (name === "rsync" && (RSYNC_SHORT.test(a) || RSYNC_LONG.has(a) || RSYNC_LONG_VALUE.test(a))) continue;
    else throw deny(`opción de ${name} no permitida: ${a}`);
  }
  if (operands.length < 2) throw deny(`${name} necesita al menos un origen local y un destino <alias>:<ruta>`);

  const dest = operands[operands.length - 1];
  if (dest.includes("::") || dest.includes("://")) throw deny(`${name} a un daemon o URL: solo <alias>:<ruta>`);
  const m = dest.match(/^([^:/\\]+):(.*)$/);
  if (!m) throw deny(`${name} solo sube archivos: el destino tiene que ser <alias>:<ruta>`);
  checkAlias(m[1], ctx);
  if (/sshd_config|authorized_keys|(^|\/)\.ssh(\/|$)/.test(m[2])) {
    throw deny(`${name} hacia la config de ssh o authorized_keys: puede dejarte sin acceso; hacelo a mano`);
  }

  for (const src of operands.slice(0, -1)) {
    if (src.includes(":")) throw deny(`${name} solo de subida: "${src}" es una ruta remota`);
    if (src.startsWith("~")) throw deny(`${name}: "${src}" está fuera del proyecto`);
    const rel = relative(ctx.projectDir, resolve(ctx.cwd, src));
    if (rel.startsWith("..") || isAbsolute(rel)) throw deny(`${name}: "${src}" está fuera del proyecto`);
  }
  return { alias: m[1], detail: seg.words.join(" ") };
}

// ------------------------------------------------------------
// Comando remoto: reglas comunes
// ------------------------------------------------------------

/** Comandos que imprimen contenido: sus argumentos se revisan contra las rutas de secretos. */
const CONTENT_READERS = new Set([
  "cat", "head", "tail", "grep", "egrep", "fgrep", "rg", "cut", "sort", "uniq", "diff",
  "jq", "git", "tac", "nl", "strings", "less", "more", "od", "xxd", "base64",
]);

const SECRET_PATHS = [
  /(^|[/:])\.env(\.(?!(example|sample|template|dist)$)[^/]+)?$/i,
  /\.(pem|key|p12|pfx|jks|keystore)$/i,
  /(^|[/:])id_(rsa|dsa|ecdsa|ed25519)(_sk)?$/i,
  /(^|[/:~])\.ssh(\/|$)/,
  /(^|\/)g?shadow-?$/,
  /(^|\/)sudoers(\.d)?(\/|$)/,
  /(^|[/:])(\.git-credentials|\.netrc|\.pgpass|\.my\.cnf|\.htpasswd|\.npmrc|\.pypirc|wp-config\.php)$/i,
  /(^|[/:])\.(aws|docker|kube)\//,
  /(^|[/:])credentials(\.json)?$/i,
  /\/proc\/[^/]+\/environ$/,
  /(^|\/)run\/secrets(\/|$)/,
];

/** Nombres que un glob podría abarcar sin que el patrón los nombre (`.e*` → `.env`). */
const SECRET_SAMPLES = [
  ".env", ".env.local", ".env.production", "id_rsa", "id_ed25519", "server.key", "cert.pem",
  "shadow", "credentials", "wp-config.php", ".htpasswd", ".netrc", ".pgpass", ".git-credentials",
  ".npmrc", "environ", ".ssh", ".aws", ".docker", "secrets", "sudoers",
];

function globToRegex(glob) {
  const body = glob
    .replace(/[.+^${}()|\\]/g, "\\$&")
    .replace(/\*/g, "[^/]*")
    .replace(/\?/g, "[^/]");
  return new RegExp(`^${body}$`);
}

function checkNoSecrets(words) {
  const [name, ...args] = words;
  const targets = CONTENT_READERS.has(name) ? args : [];
  // Una redirección de entrada (`< archivo`) lee el archivo, sea cual sea el comando.
  for (let k = 0; k < words.length; k++) {
    if (words[k] === "<") targets.push(words[k + 1] ?? "");
    else if (words[k].startsWith("<")) targets.push(words[k].replace(/^<+/, ""));
  }
  for (const t of targets) {
    if (SECRET_PATHS.some((re) => re.test(t))) {
      throw deny(`"${t}" puede tener secretos: lo que se lee termina en el transcript`);
    }
    for (const part of t.split("/")) {
      if (!/[*?[]/.test(part)) continue;
      const re = globToRegex(part);
      const hit = SECRET_SAMPLES.find((s) => (s.startsWith(".") ? part.startsWith(".") : true) && re.test(s));
      if (hit) throw deny(`el patrón "${t}" puede abarcar "${hit}", que tiene secretos: usá uno más específico`);
    }
  }
}

/** Lo que imprime variables de entorno o config con secretos, aunque solo lea. */
function checkSecretCommands(words) {
  const [name, ...args] = words;
  const rest = args.filter((a) => !a.startsWith("-"));
  if (name === "printenv" || (name === "env" && rest.length === 0)) {
    throw deny(`${name} imprime las variables de entorno, que suelen tener secretos`);
  }
  if ((name === "set" || name === "export" || name === "declare") && rest.length === 0) {
    throw deny(`${name} sin argumentos imprime las variables de entorno`);
  }
  if ((name === "docker" || name === "podman") && (rest[0] === "inspect" || rest[1] === "inspect")) {
    throw deny(`${name} inspect imprime las variables de entorno del contenedor`);
  }
  if (name === "systemctl" && rest[0] === "show") throw deny("systemctl show imprime el entorno del servicio");
}

/** Lo que no termina nunca o necesita una terminal. */
function checkTerminates(words) {
  const [name, ...args] = words;
  const sub = args.filter((a) => !a.startsWith("-"));
  if (["vi", "vim", "nvim", "nano", "emacs", "less", "more", "top", "htop", "watch", "sudoedit"].includes(name)) {
    throw deny(`${name} es interactivo: no termina sin una terminal`);
  }
  const follows = (re) => args.some((a) => a.startsWith("--follow") || re.test(a));
  if (name === "tail" && follows(/^-[a-zA-Z0-9]*[fF]/)) throw deny("tail -f no termina nunca: usá tail -n <líneas>");
  if (name === "journalctl" && follows(/^-[a-zA-Z]*f/)) throw deny("journalctl -f no termina nunca: usá -n <líneas> o --since");
  if ((name === "docker" || name === "podman") && sub.includes("logs") && follows(/^-[a-zA-Z]*f/)) {
    throw deny(`${name} logs -f no termina nunca: usá --tail <líneas>`);
  }
}

// ------------------------------------------------------------
// Comando remoto: server-inspector
// ------------------------------------------------------------

const SYSTEMCTL_READ = new Set([
  "status", "is-active", "is-enabled", "is-failed", "is-system-running", "list-units",
  "list-unit-files", "list-timers", "list-sockets", "list-dependencies",
]);

/** Comandos de estado del servidor, sin chequeo de argumentos. */
const SERVER_PLAIN = new Set(["uptime", "ps", "w", "who", "whoami", "id", "uname", "lsblk", "findmnt", "last", "lsof", "pgrep", "nproc"]);

const flagsOf = (args) => args.filter((a) => a.startsWith("-"));
const operandsOf = (args) => args.filter((a) => !a.startsWith("-"));

/** Reglas por comando: devuelven sin error si es de lectura, o lanzan Denied. */
const SERVER_READ = {
  free(args) {
    if (args.some((a) => /^-s|^--seconds|^-c|^--count/.test(a))) throw deny("free -s repite sin fin");
  },
  netstat(args) {
    if (args.some((a) => /^-[a-zA-Z]*c|^--continuous/.test(a))) throw deny("netstat -c no termina nunca");
  },
  ss(args) {
    if (args.some((a) => /^-[a-zA-Z]*[KE]|^--kill|^--events/.test(a))) throw deny("ss -K cierra conexiones");
  },
  hostname(args) {
    const ok = ["-f", "-I", "-i", "-s", "-d", "-A", "--fqdn", "--all-ip-addresses", "--ip-address", "--short", "--domain"];
    if (!args.every((a) => ok.includes(a))) throw deny("hostname con argumentos cambia el nombre del host");
  },
  date(args) {
    if (!args.every((a) => a.startsWith("+") || ["-u", "-R", "-I", "--utc"].includes(a) || /^--(rfc|iso)/.test(a))) {
      throw deny("date con argumentos puede cambiar la hora del sistema");
    }
  },
  timedatectl(args) {
    if (args.length && !["status", "show"].includes(operandsOf(args)[0])) throw deny("timedatectl solo status/show");
  },
  hostnamectl(args) {
    if (args.length && operandsOf(args)[0] !== "status") throw deny("hostnamectl solo status");
  },
  systemctl(args) {
    if (args.some((a) => /^(-H|--host|-M|--machine)/.test(a))) throw deny("systemctl -H/-M apunta a otra máquina");
    const sub = operandsOf(args)[0];
    if (sub && !SYSTEMCTL_READ.has(sub)) throw deny(`systemctl ${sub} no es de lectura`);
  },
  journalctl(args) {
    const bad = args.find((a) =>
      /^--(vacuum|rotate|flush|sync|relinquish-var|smart-relinquish-var|setup-keys|update-catalog|cursor-file)/.test(a)
    );
    if (bad) throw deny(`journalctl ${bad} modifica el journal`);
  },
  dmesg(args) {
    if (args.some((a) => /^-[a-zA-Z]*[cCDEnwW]|^--(clear|read-clear|console|follow)/.test(a))) {
      throw deny("dmesg con esa opción borra el buffer, cambia la consola o no termina");
    }
  },
  ip(args) {
    const flags = ["-4", "-6", "-br", "-brief", "-c", "-color", "-j", "-json", "-p", "-pretty", "-s", "-stats", "-d", "-details", "-o", "-oneline"];
    const ops = operandsOf(args);
    if (!flagsOf(args).every((f) => flags.includes(f))) throw deny("opción de ip no permitida");
    const objects = ["addr", "address", "a", "route", "r", "link", "l", "neigh", "n", "rule", "ru"];
    if (!objects.includes(ops[0])) throw deny(`ip ${ops[0] ?? ""} no es de lectura`.trim());
    if (ops[1] && !["show", "list", "ls", "get"].includes(ops[1])) throw deny(`ip ${ops[0]} ${ops[1]} modifica la red`);
  },
  docker(args) {
    if (args[0]?.startsWith("-")) throw deny("opciones globales de docker (--host, --context) apuntan a otro daemon");
    const [sub, ...rest] = args;
    if (["ps", "images", "version", "info", "top", "logs"].includes(sub)) return;
    if (sub === "stats") {
      if (!rest.includes("--no-stream")) throw deny("docker stats sin --no-stream no termina nunca");
      return;
    }
    if (["container", "image", "network", "volume"].includes(sub) && ["ls", "list"].includes(rest[0])) return;
    if (sub === "system" && ["df", "info"].includes(rest[0])) return;
    if (sub === "compose") return SERVER_READ["docker-compose"](rest);
    throw deny(`docker ${sub ?? ""} no es de lectura`.trim());
  },
  "docker-compose"(args) {
    let k = 0;
    while (k < args.length && args[k].startsWith("-")) {
      if (["-f", "--file", "-p", "--project-name", "--project-directory"].includes(args[k])) k += 2;
      else throw deny(`opción de docker compose no permitida: ${args[k]}`);
    }
    const sub = args[k];
    if (!["ps", "ls", "logs", "images", "top", "version"].includes(sub)) {
      throw deny(`docker compose ${sub ?? ""} no es de lectura${sub === "config" ? " (config imprime los secretos interpolados)" : ""}`);
    }
  },
  crontab(args) {
    const ok = args.join(" ") === "-l" || /^-u \S+ -l$/.test(args.join(" "));
    if (!ok) throw deny("crontab solo -l");
  },
  ufw(args) {
    if (args[0] !== "status") throw deny("ufw solo status");
  },
  nginx(args) {
    if (!args.length || !args.every((a) => ["-t", "-q", "-v", "-V"].includes(a))) throw deny("nginx solo -t, -v o -V");
  },
  apachectl(args) {
    if (args.length !== 1 || !["-t", "configtest", "-S", "-M", "-v", "-V"].includes(args[0])) {
      throw deny("apachectl solo -t, configtest, -S, -M, -v o -V");
    }
  },
  certbot(args) {
    if (args.join(" ") !== "certificates") throw deny("certbot solo certificates");
  },
};
SERVER_READ.apache2ctl = SERVER_READ.apachectl;

function checkRemoteReadSegment(words, viaSudo = false) {
  const [name, ...args] = words;
  if (name === "sudo") {
    if (viaSudo) throw deny("sudo dentro de sudo");
    if (args[0] !== "-n" && args[0] !== "--non-interactive") {
      throw deny("sudo solo como `sudo -n <comando de lectura>`: sin -n pide contraseña y se cuelga");
    }
    const rest = args.slice(1);
    if (!rest.length || rest[0].startsWith("-")) throw deny("sudo -n no admite más opciones: solo un comando de lectura");
    return checkRemoteReadSegment(rest, true);
  }
  checkSecretCommands(words);
  checkTerminates(words);
  checkNoSecrets(words);
  if (SERVER_PLAIN.has(name)) return;
  if (name in SERVER_READ) return SERVER_READ[name](args);
  checkReadonlySegment(words);
}

function checkRemoteRead(remote) {
  for (const seg of parseCommand(remote)) {
    if (seg.expands) {
      throw deny("expansión de variables en el comando remoto ($…): puede imprimir secretos del entorno");
    }
    checkRemoteReadSegment(seg.words);
  }
}

// ------------------------------------------------------------
// Comando remoto: server-operator
// ------------------------------------------------------------

/**
 * Saca los envoltorios que ejecutan el comando que les sigue (`sudo`, `env`,
 * `nohup`, `xargs`…) para que el bloqueo duro vea el comando real.
 */
function unwrap(words) {
  let w = [...words];
  for (let guard = 0; guard < 10 && w.length; guard++) {
    const [name, ...args] = w;
    let k = 0;
    if (name === "sudo" || name === "doas") {
      while (k < args.length && args[k].startsWith("-")) {
        const a = args[k];
        if (a === "-e" || a === "--edit") throw deny("sudo -e abre un editor interactivo");
        if (["-s", "-i", "--shell", "--login"].includes(a) && k === args.length - 1) {
          throw deny(`sudo ${a} sin comando abre una shell interactiva`);
        }
        k += ["-u", "-g", "-C", "-D", "-h", "--user", "--group"].includes(a) ? 2 : 1;
      }
    } else if (name === "env") {
      while (k < args.length && (args[k].startsWith("-") || /^[A-Za-z_][A-Za-z0-9_]*=/.test(args[k]))) {
        k += args[k] === "-u" ? 2 : 1;
      }
      if (k >= args.length) return ["env"];
    } else if (["nohup", "time", "command", "exec", "builtin"].includes(name)) {
      k = 0;
    } else if (["nice", "ionice", "stdbuf", "timeout", "xargs"].includes(name)) {
      const withValue = { nice: ["-n"], ionice: ["-c", "-n"], stdbuf: [], timeout: ["-s", "-k"], xargs: ["-I", "-n", "-P", "-L", "-d", "-a", "-s", "-E"] };
      while (k < args.length && args[k].startsWith("-")) k += withValue[name].includes(args[k]) ? 2 : 1;
      if (name === "timeout") k++; // la duración
    } else {
      return w;
    }
    w = args.slice(k);
  }
  return w;
}

const SHELLS = new Set(["sh", "bash", "dash", "zsh", "ksh"]);
const SSH_UNIT = /^(ssh|sshd|openssh-server)(\.service|\.socket)?$/;
const DISK_DEVICE = /^\/dev\/(sd|nvme|vd|xvd|hd|mmcblk|md|dm-|mapper\/|disk\/)/;
const SYSTEMCTL_POWER = new Set([
  "reboot", "poweroff", "halt", "kexec", "soft-reboot", "suspend", "hibernate", "hybrid-sleep",
  "rescue", "emergency", "isolate", "default", "switch-root",
]);

/** `/`, `/*`, `/etc`, `/etc/`, `/etc/*`, `~`, `.`, `*`: borrarlos o cambiarles permisos en bloque no se deshace. */
function isCriticalPath(p) {
  const path = p.replace(/\/+$/, "") || "/";
  return (
    /^\/(\*|[^/]+(\/\*)?)?$/.test(path) ||
    ["~", "~/*", ".", "./*", "..", "*"].includes(path)
  );
}

function hasRecursiveFlag(args, letters) {
  return args.some((a) => a === "--recursive" || new RegExp(`^-[a-zA-Z]*[${letters}]`).test(a));
}

/** Lo que deja sin acceso al servidor o no se deshace desde remoto: se bloquea aunque se apruebe. */
function checkHardBlock(seg, depth = 0) {
  if (depth > 3) throw deny("demasiados niveles de shell anidada");
  for (const target of seg.redirects) {
    if (DISK_DEVICE.test(target)) throw deny(`escribir en ${target} pisa un disco`);
    if (/sshd_config|authorized_keys/.test(target)) throw deny("tocar sshd_config o authorized_keys puede dejarte sin acceso");
  }
  const words = unwrap(seg.words);
  if (!words.length) return;
  const [name, ...args] = words;
  const ops = operandsOf(args);
  const block = (why) => {
    throw deny(`${why}: se hace a mano, no desde el agente`);
  };

  if (words.some((w) => /sshd_config|authorized_keys/.test(w))) block("tocar sshd_config o authorized_keys puede dejarte sin acceso");
  checkSecretCommands(words);
  checkTerminates(words);
  checkNoSecrets(words);

  if (SHELLS.has(name) || name === "eval") {
    const idx = name === "eval" ? -1 : args.findIndex((a) => /^-[a-zA-Z]*c[a-zA-Z]*$/.test(a));
    const inner = name === "eval" ? args.join(" ") : idx >= 0 ? args[idx + 1] : null;
    if (inner != null) checkOperateString(inner, depth + 1);
    return;
  }
  if (["reboot", "shutdown", "poweroff", "halt"].includes(name)) block(`${name} apaga o reinicia el servidor`);
  if ((name === "init" || name === "telinit") && ops.some((a) => /^[0156sS]$/.test(a))) block(`${name} cambia el runlevel`);
  if (name === "systemctl") {
    const sub = ops[0];
    if (SYSTEMCTL_POWER.has(sub)) block(`systemctl ${sub} apaga, reinicia o aísla el servidor`);
    if (sub && !SYSTEMCTL_READ.has(sub) && ops.slice(1).some((u) => SSH_UNIT.test(u))) {
      block(`systemctl ${sub} sobre ssh puede dejarte sin acceso`);
    }
  }
  if (name === "service" && SSH_UNIT.test(ops[0] ?? "") && ops[1] && ops[1] !== "status") {
    block(`service ${ops[0]} ${ops[1]} puede dejarte sin acceso`);
  }
  if (/^mkfs(\.|$)/.test(name) || ["mke2fs", "mkswap", "wipefs", "fdisk", "sfdisk", "sgdisk", "gdisk", "cfdisk", "parted", "blkdiscard", "shred"].includes(name)) {
    block(`${name} borra o reparticiona un disco`);
  }
  if (name === "dd" && args.some((a) => a.startsWith("of=/dev/"))) block("dd hacia un dispositivo pisa el disco");
  if (name === "tee" && args.some((a) => DISK_DEVICE.test(a))) block("tee hacia un dispositivo pisa el disco");
  if (name === "rm" && (args.includes("--no-preserve-root") || (hasRecursiveFlag(args, "rR") && ops.some(isCriticalPath)))) {
    block("rm recursivo sobre / o un directorio de primer nivel");
  }
  if (["chmod", "chown", "chgrp"].includes(name) && hasRecursiveFlag(args, "R") && ops.some(isCriticalPath)) {
    block(`${name} -R sobre / o un directorio de primer nivel`);
  }
  if (/^ip6?tables(-legacy|-nft)?$/.test(name)) {
    const modifies = args.some((a) =>
      /^-[a-zA-Z]*[AIDRFXPNEZ]/.test(a) || /^--(append|insert|delete|replace|flush|delete-chain|policy|new-chain|rename-chain|zero)/.test(a)
    );
    const lists = args.some((a) => /^-[a-zA-Z]*[LS]/.test(a) || /^--list/.test(a));
    if (modifies || !lists) block(`${name} cambia el firewall`);
  }
  if (/^ip6?tables(-legacy|-nft)?-(restore|apply)$/.test(name)) block(`${name} cambia el firewall`);
  if (name === "nft" && ops[0] !== "list") block("nft cambia el firewall");
  if (name === "ufw" && args[0] !== "status") block("ufw cambia el firewall");
  if (name === "firewall-cmd" && !args.every((a) => /^--(list|get|query|state|version)/.test(a))) block("firewall-cmd cambia el firewall");
  if (["passwd", "chpasswd", "userdel", "usermod", "deluser", "chage", "vipw", "vigr"].includes(name)) {
    block(`${name} cambia usuarios o contraseñas`);
  }
  if (name === "su") block("su abre una shell de otro usuario; usá sudo con el comando");
  if (["ssh", "scp", "sftp", "mosh", "telnet"].includes(name)) block("saltar a otro host desde el servidor");
  if (name === "rsync" && args.some((a) => a.includes(":") || a === "-e" || a.startsWith("--rsh"))) {
    block("rsync desde el servidor hacia otro host");
  }
}

/** Un solo comando remoto (los pipes sí), sin variables y sin nada de la lista de bloqueo duro. */
function checkOperateString(remote, depth = 0) {
  const segs = parseCommand(remote, { allowWrites: true });
  if (!segs.length) throw deny("comando remoto vacío");
  for (const seg of segs) {
    if ((seg.op && seg.op !== "|") || seg.background) {
      throw deny("un solo comando remoto por llamada (sin ;, &&, ||, & ni saltos de línea): cada cambio, una aprobación");
    }
    if (seg.expands) throw deny("variables ($…) en el comando remoto: escribí el valor literal, para que el prompt muestre lo que corre");
    checkHardBlock(seg, depth);
  }
}

function checkRemoteOperate(remote) {
  checkOperateString(remote);
}

// ------------------------------------------------------------
// Entrada
// ------------------------------------------------------------

function check(command, ctx) {
  const segments = parseCommand(command);
  ctx.hasCd = segments.some((s) => s.words[0] === "cd" || s.words[0] === "pushd");
  const remoteOps = [];
  for (const seg of segments) {
    const name = seg.words[0];
    if (name === "ssh") remoteOps.push(checkSsh(seg, ctx));
    else if (name === "scp" || name === "rsync") remoteOps.push(checkCopy(seg, ctx));
    else checkReadonlySegment(seg.words);
  }
  if (ctx.mode === "operate" && remoteOps.length > 1) {
    throw deny("un solo ssh, scp o rsync por llamada: cada cambio, una aprobación");
  }
  return remoteOps;
}

function fail(message) {
  const suffix =
    MODE === "operate"
      ? "server-operator (ADR-026): si es un cambio que hace falta y el hook lo bloquea, dejalo en Pendiente manual del reporte; no le busques la vuelta."
      : "server-inspector es de solo lectura (ADR-026): si el comando sí es de lectura y falta en la lista, reportalo al agente principal en vez de buscarle la vuelta.";
  process.stderr.write(`Bloqueado: ${message}. ${suffix}\n`);
  process.exit(2);
}

function main() {
  let input;
  try {
    input = JSON.parse(readFileSync(0, "utf8"));
  } catch {
    process.stderr.write("ssh-guard: no se pudo leer la llamada; se bloquea por seguridad.\n");
    process.exit(2);
  }
  const command = input?.tool_input?.command;
  if (typeof command !== "string" || command.trim() === "") process.exit(0);
  if (!MODE) {
    process.stderr.write("ssh-guard: falta el modo (--inspect o --operate) en el frontmatter; se bloquea por seguridad.\n");
    process.exit(2);
  }

  const cwd = typeof input.cwd === "string" && input.cwd ? input.cwd : process.cwd();
  const projectDir = process.env.CLAUDE_PROJECT_DIR || cwd;
  const ctx = { mode: MODE, cwd, projectDir, aliases: loadSshAliases(), hostList: loadHostList(projectDir) };

  let remoteOps;
  try {
    remoteOps = check(command, ctx);
    if (MODE === "operate" && remoteOps.length && ["bypassPermissions", "dontAsk"].includes(input.permission_mode)) {
      throw deny(
        `la sesión está en ${input.permission_mode} y ahí el pedido de aprobación no está garantizado. ` +
          "Pasá la sesión principal a default, acceptEdits o auto"
      );
    }
  } catch (err) {
    if (!(err instanceof Denied)) throw err;
    fail(err.message);
  }

  if (MODE === "operate" && remoteOps.length) {
    const [op] = remoteOps;
    process.stdout.write(
      JSON.stringify({
        hookSpecificOutput: {
          hookEventName: "PreToolUse",
          permissionDecision: "ask",
          permissionDecisionReason: `server-operator quiere correr en "${op.alias}": ${op.detail}`,
        },
      })
    );
  }
  process.exit(0);
}

main();
