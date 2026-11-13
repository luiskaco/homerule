// Casos del hook de los agentes de servidores (.claude/hooks/ssh-guard.mjs, ADR-026).
// Corre el hook como lo corre Claude Code: JSON por stdin, código de salida y,
// en modo operate, el "ask" por stdout.
//   node scripts/test-ssh-guard.mjs
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const HOOK = fileURLToPath(new URL("../.claude/hooks/ssh-guard.mjs", import.meta.url));

// HOME falso con su ~/.ssh/config, para no depender del de la máquina.
const HOME = mkdtempSync(join(tmpdir(), "ssh-guard-home-"));
mkdirSync(join(HOME, ".ssh", "conf.d"), { recursive: true });
writeFileSync(
  join(HOME, ".ssh", "config"),
  [
    "# servidores de prueba",
    "Host web staging-db   # comentario al final",
    "  HostName 10.0.0.5",
    "  User deploy",
    "Host *.internal",
    "  User ops",
    "Host !bad prod-*",
    "Include extra.conf",
    "Include conf.d/*",
    "",
  ].join("\n")
);
writeFileSync(join(HOME, ".ssh", "extra.conf"), "Host extra-box\n  HostName 10.0.0.9\n");
writeFileSync(join(HOME, ".ssh", "conf.d", "a.conf"), "Host conf-box\n");

// Un proyecto con lista de alias y otro sin.
const WITH_LIST = mkdtempSync(join(tmpdir(), "ssh-guard-proj-"));
mkdirSync(join(WITH_LIST, ".claude"));
writeFileSync(join(WITH_LIST, ".claude", "ssh-hosts.txt"), "# alias de este proyecto\nweb\nextra-box\n");
const NO_LIST = mkdtempSync(join(tmpdir(), "ssh-guard-proj-"));

function run(mode, command, { project = WITH_LIST, permissionMode = "default" } = {}) {
  const res = spawnSync(process.execPath, mode ? [HOOK, `--${mode}`] : [HOOK], {
    input: JSON.stringify({
      tool_name: "Bash",
      tool_input: { command },
      cwd: project,
      permission_mode: permissionMode,
    }),
    encoding: "utf8",
    env: { ...process.env, HOME, USERPROFILE: HOME, CLAUDE_PROJECT_DIR: project },
  });
  if (res.status === 2) return "deny";
  if (res.status !== 0) return `exit ${res.status}: ${res.stderr.trim()}`;
  return /"permissionDecision":"ask"/.test(res.stdout) ? "ask" : "allow";
}

// [modo, comando, esperado, opciones]
const CASES = [
  // ---------- server-inspector: pasa ----------
  ["inspect", "ssh web 'uptime'", "allow"],
  ["inspect", "ssh -o BatchMode=yes -o ConnectTimeout=5 web 'df -h && free -m'", "allow"],
  ["inspect", "ssh -T -oBatchMode=yes web 'uptime'", "allow"],
  ["inspect", `ssh -T web "journalctl -u nginx -n 200 --no-pager | grep -i error"`, "allow"],
  ["inspect", "ssh web 'systemctl status nginx --no-pager'", "allow"],
  ["inspect", "ssh web 'systemctl --failed --no-pager'", "allow"],
  ["inspect", `ssh web 'docker ps --format "{{.Names}}"'`, "allow"],
  ["inspect", "ssh web 'docker logs --tail 100 app 2>&1'", "allow"],
  ["inspect", "ssh web 'docker stats --no-stream'", "allow"],
  ["inspect", "ssh web 'docker compose -f /srv/app/compose.yml ps'", "allow"],
  ["inspect", `ssh web 'sudo -n journalctl -u app --since "1 hour ago" --no-pager'`, "allow"],
  ["inspect", "ssh web 'tail -n 100 /var/log/nginx/error.log'", "allow"],
  ["inspect", "ssh web 'tail -n 50 /var/log/nginx/*.log'", "allow"],
  ["inspect", "ssh web 'ps aux --sort=-%mem' | head -20", "allow"],
  ["inspect", "ssh web 'ss -tulpn'", "allow"],
  ["inspect", "ssh web 'ip -br addr show'", "allow"],
  ["inspect", "ssh web 'crontab -l'", "allow"],
  ["inspect", `ssh web 'grep -c "error$" /var/log/app.log'`, "allow"],
  ["inspect", "ssh web 'ls -la ~/.ssh'", "allow"],
  ["inspect", "ssh web 'cat /var/www/app/.env.example'", "allow"],
  ["inspect", "ssh web 'sudo -n nginx -t'", "allow"],
  ["inspect", "ssh web 'cd /var/www/app && git log --oneline -5'", "allow"],
  ["inspect", "ssh extra-box 'uptime'", "allow"],
  ["inspect", "ssh staging-db 'uptime'", "allow", { project: NO_LIST }],
  ["inspect", "ssh web 'uptime'", "allow", { permissionMode: "bypassPermissions" }],
  ["inspect", "git status && ls -la", "allow"],

  // ---------- server-inspector: se bloquea ----------
  // alias
  ["inspect", "ssh deploy@10.0.0.5 'uptime'", "deny"],
  ["inspect", "ssh 10.0.0.5 'uptime'", "deny"],
  ["inspect", "ssh ssh://web 'uptime'", "deny"],
  ["inspect", "ssh unknown 'uptime'", "deny"],
  ["inspect", "ssh app.internal 'uptime'", "deny"],
  ["inspect", "ssh staging-db 'uptime'", "deny"],
  ["inspect", "ssh conf-box 'uptime'", "deny", { project: NO_LIST }],
  ["inspect", "ssh '#' 'uptime'", "deny", { project: NO_LIST }],
  // opciones
  ["inspect", "ssh -L 8080:localhost:80 web 'uptime'", "deny"],
  ["inspect", "ssh -o ProxyCommand='nc evil 22' web 'uptime'", "deny"],
  ["inspect", "ssh -J bastion web 'uptime'", "deny"],
  ["inspect", "ssh -A web 'uptime'", "deny"],
  ["inspect", "ssh -F /tmp/cfg web 'uptime'", "deny"],
  ["inspect", "ssh web -o ProxyCommand=x 'uptime'", "deny"],
  ["inspect", "ssh web -R 9000:localhost:22 'uptime'", "deny"],
  // forma del comando
  ["inspect", "ssh web", "deny"],
  ["inspect", "ssh web ''", "deny"],
  ["inspect", "cat script.sh | ssh web 'sh'", "deny"],
  ["inspect", "ssh web 'bash -s' < script.sh", "deny"],
  ["inspect", `ssh web "cat $HOME/x"`, "deny"],
  ["inspect", "ssh web cat *.log", "deny"],
  // escritura y comandos fuera de la lista
  ["inspect", "ssh web 'rm -rf /tmp/x'", "deny"],
  ["inspect", "ssh web 'systemctl restart nginx'", "deny"],
  ["inspect", "ssh web 'echo hola > /tmp/x'", "deny"],
  ["inspect", "ssh web 'cat $(which x)'", "deny"],
  ["inspect", "ssh web 'uptime; reboot'", "deny"],
  ["inspect", "ssh web 'ssh db uptime'", "deny"],
  ["inspect", "ssh web 'crontab -r'", "deny"],
  ["inspect", "ssh web 'hostname evil'", "deny"],
  ["inspect", "ssh web 'dmesg -c'", "deny"],
  ["inspect", "ssh web 'ss -K dst 1.2.3.4'", "deny"],
  ["inspect", "ssh web 'systemctl -H other status x'", "deny"],
  ["inspect", "ssh web 'docker -H tcp://x ps'", "deny"],
  ["inspect", "ssh web 'docker compose config'", "deny"],
  ["inspect", "ssh web 'ip route add 10.0.0.0/8 via 1.1.1.1'", "deny"],
  ["inspect", "ssh web 'journalctl --vacuum-time=1d'", "deny"],
  // sudo
  ["inspect", "ssh web 'sudo journalctl -u x'", "deny"],
  ["inspect", "ssh web 'sudo -n -u root cat /etc/hosts'", "deny"],
  ["inspect", "ssh web 'sudo -n rm -rf /tmp/x'", "deny"],
  // secretos
  ["inspect", "ssh web 'cat .env'", "deny"],
  ["inspect", "ssh web 'cat /var/www/app/.env.production'", "deny"],
  ["inspect", "ssh web 'sudo -n cat /etc/shadow'", "deny"],
  ["inspect", "ssh web 'head ~/.ssh/id_rsa'", "deny"],
  ["inspect", "ssh web 'cat /var/www/.e*'", "deny"],
  ["inspect", "ssh web 'grep DB_PASS < /var/www/wp-config.php'", "deny"],
  ["inspect", "ssh web 'cat /proc/1/environ'", "deny"],
  ["inspect", "ssh web 'env'", "deny"],
  ["inspect", "ssh web 'printenv DATABASE_URL'", "deny"],
  ["inspect", "ssh web 'echo $DATABASE_URL'", "deny"],
  ["inspect", "ssh web 'docker inspect app'", "deny"],
  ["inspect", "ssh web 'systemctl show app'", "deny"],
  // lo que no termina
  ["inspect", "ssh web 'tail -f /var/log/syslog'", "deny"],
  ["inspect", "ssh web 'journalctl -fu nginx'", "deny"],
  ["inspect", "ssh web 'docker logs -f app'", "deny"],
  ["inspect", "ssh web 'docker stats'", "deny"],
  // copias y locales
  ["inspect", "scp web:/etc/passwd .", "deny"],
  ["inspect", "rsync -a dist/ web:/var/www/", "deny"],
  ["inspect", "rm -rf x", "deny"],

  // ---------- server-operator: pide aprobación ----------
  ["operate", "ssh web 'sudo systemctl restart nginx'", "ask"],
  ["operate", "ssh -o BatchMode=yes web 'sudo nginx -t'", "ask"],
  ["operate", "ssh web 'uptime'", "ask"],
  ["operate", `ssh web "sudo sed -i 's/worker_processes 1/worker_processes 2/' /etc/nginx/nginx.conf"`, "ask"],
  ["operate", "ssh web 'sudo cp -a /etc/nginx/nginx.conf /etc/nginx/nginx.conf.bak-20261026'", "ask"],
  ["operate", `ssh web 'echo "ok" | sudo tee /var/www/app/health.txt'`, "ask"],
  ["operate", "ssh web 'echo hola > /tmp/x'", "ask"],
  ["operate", "ssh web 'git -C /var/www/app pull --ff-only'", "ask"],
  ["operate", "ssh web 'sudo rm -rf /var/www/app/cache'", "ask"],
  ["operate", "ssh web 'sudo iptables -L -n'", "ask"],
  ["operate", "ssh web 'sudo ufw status'", "ask"],
  ["operate", "ssh web 'sudo systemctl status ssh'", "ask"],
  ["operate", "scp dist/app.js web:/var/www/app/", "ask"],
  ["operate", "scp -r dist web:/var/www/app", "ask"],
  ["operate", "rsync -az --delete --exclude=.git dist/ web:/var/www/app/", "ask"],
  ["operate", "ssh web 'uptime'", "ask", { permissionMode: "auto" }],
  ["operate", "ssh web 'uptime'", "ask", { permissionMode: "acceptEdits" }],

  // ---------- server-operator: pasa sin pedir (local, de lectura) ----------
  ["operate", "git status", "allow"],
  ["operate", "cat docs/RUNBOOK.md", "allow"],
  ["operate", "git status", "allow", { permissionMode: "bypassPermissions" }],

  // ---------- server-operator: se bloquea ----------
  // modo de permisos y lista de alias
  ["operate", "ssh web 'uptime'", "deny", { permissionMode: "bypassPermissions" }],
  ["operate", "ssh web 'uptime'", "deny", { permissionMode: "dontAsk" }],
  ["operate", "ssh web 'uptime'", "deny", { project: NO_LIST }],
  ["operate", "ssh staging-db 'uptime'", "deny"],
  ["operate", "ssh deploy@10.0.0.5 'uptime'", "deny"],
  // un cambio por llamada
  ["operate", "ssh web 'sudo systemctl restart nginx && sudo systemctl status nginx'", "deny"],
  ["operate", "ssh web 'cd /var/www/app; git pull'", "deny"],
  ["operate", "ssh web 'sudo systemctl restart app &'", "deny"],
  ["operate", "ssh web 'uptime' && ssh web 'df -h'", "deny"],
  // bloqueo duro
  ["operate", "ssh web 'sudo reboot'", "deny"],
  ["operate", "ssh web 'sudo shutdown -h now'", "deny"],
  ["operate", "ssh web 'sudo systemctl reboot'", "deny"],
  ["operate", "ssh web 'sudo systemctl stop sshd'", "deny"],
  ["operate", "ssh web 'sudo service ssh restart'", "deny"],
  ["operate", "ssh web 'sudo mkfs.ext4 /dev/sdb1'", "deny"],
  ["operate", "ssh web 'sudo dd if=/dev/zero of=/dev/sda bs=1M'", "deny"],
  ["operate", "ssh web 'echo x | sudo tee /dev/sda'", "deny"],
  ["operate", "ssh web 'sudo rm -rf /'", "deny"],
  ["operate", "ssh web 'sudo rm -rf /etc'", "deny"],
  ["operate", "ssh web 'sudo rm -rf /var/*'", "deny"],
  ["operate", "ssh web 'rm -rf ~'", "deny"],
  ["operate", "ssh web 'sudo rm -r --no-preserve-root /'", "deny"],
  ["operate", "ssh web 'sudo iptables -F'", "deny"],
  ["operate", "ssh web 'sudo iptables -A INPUT -p tcp --dport 22 -j DROP'", "deny"],
  ["operate", "ssh web 'sudo ufw deny 22'", "deny"],
  ["operate", "ssh web 'sudo nft flush ruleset'", "deny"],
  ["operate", `ssh web "sudo sed -i 's/PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config"`, "deny"],
  ["operate", "ssh web 'echo key >> ~/.ssh/authorized_keys'", "deny"],
  ["operate", "ssh web 'sudo passwd deploy'", "deny"],
  ["operate", "ssh web 'sudo userdel bob'", "deny"],
  ["operate", "ssh web 'sudo chmod -R 777 /'", "deny"],
  ["operate", "ssh web 'sudo chown -R www-data /var'", "deny"],
  ["operate", `ssh web "sudo bash -c 'reboot'"`, "deny"],
  ["operate", `ssh web "sudo sh -c 'echo ok; reboot'"`, "deny"],
  ["operate", "ssh web 'sudo nohup reboot'", "deny"],
  ["operate", "ssh web 'echo x | xargs sudo reboot'", "deny"],
  ["operate", "ssh web 'sudo timeout 5 shutdown now'", "deny"],
  ["operate", "ssh web 'ssh db uptime'", "deny"],
  ["operate", "ssh web 'su - root'", "deny"],
  // secretos, variables y lo que no termina
  ["operate", "ssh web 'cat .env'", "deny"],
  ["operate", "ssh web 'env'", "deny"],
  ["operate", "ssh web 'sudo printenv'", "deny"],
  ["operate", "ssh web 'echo $DB_PASSWORD'", "deny"],
  ["operate", "ssh web 'sudo cat $(echo x)'", "deny"],
  ["operate", "ssh web 'tail -f /var/log/syslog'", "deny"],
  ["operate", "ssh web 'sudo vim /etc/hosts'", "deny"],
  ["operate", "ssh web 'sudo -i'", "deny"],
  ["operate", "ssh web 'sudo -e /etc/hosts'", "deny"],
  // scp / rsync
  ["operate", "scp web:/etc/passwd .", "deny"],
  ["operate", "scp /etc/passwd web:/tmp/", "deny"],
  ["operate", "scp ~/secreto web:/tmp/", "deny"],
  ["operate", "scp ../fuera.txt web:/tmp/", "deny"],
  ["operate", "scp -o ProxyCommand=x a.txt web:/tmp/", "deny"],
  ["operate", "scp a.txt deploy@10.0.0.5:/tmp/", "deny"],
  ["operate", "scp a.txt staging-db:/tmp/", "deny"],
  ["operate", "scp key.pub web:~/.ssh/authorized_keys", "deny"],
  ["operate", "rsync -e 'ssh -o ProxyCommand=x' a.txt web:/tmp/", "deny"],
  ["operate", "rsync --rsync-path='sudo rsync' a.txt web:/tmp/", "deny"],
  ["operate", "rsync -a dist/ web::module/", "deny"],
  ["operate", "rsync -a --remove-source-files dist/ web:/tmp/", "deny"],
  ["operate", "cd /etc && scp passwd web:/tmp/", "deny"],
  // local
  ["operate", "rm -rf x", "deny"],
  ["operate", "echo x > archivo.txt", "deny"],

  // ---------- sin modo: falla cerrado ----------
  [null, "ssh web 'uptime'", "deny"],
];

let failures = 0;
const counts = { allow: 0, ask: 0, deny: 0 };
for (const [mode, cmd, expected, opts] of CASES) {
  const got = run(mode, cmd, opts);
  counts[expected]++;
  if (got !== expected) {
    failures++;
    const extra = opts ? ` ${JSON.stringify(opts).replace(WITH_LIST, "WITH_LIST").replace(NO_LIST, "NO_LIST")}` : "";
    console.error(`✗ [${mode}] esperaba ${expected}, salió ${got}: ${cmd}${extra}`);
  }
}

// Entrada ilegible: falla cerrado.
const bad = spawnSync(process.execPath, [HOOK, "--inspect"], { input: "no es json", encoding: "utf8" });
if (bad.status !== 2) {
  failures++;
  console.error(`✗ entrada ilegible debería bloquear (salió ${bad.status})`);
}

if (failures) {
  console.error(`\n${failures} caso(s) fallaron.`);
  process.exit(1);
}
console.log(
  `ssh-guard OK — ${CASES.length + 1} casos: ${counts.allow} pasan, ${counts.ask} piden aprobación, ${counts.deny + 1} bloqueados.`
);
