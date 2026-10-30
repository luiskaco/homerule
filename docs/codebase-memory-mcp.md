# codebase-memory-mcp — cómo actualizarlo

Herramienta que arma un grafo del código de un proyecto para que la IA busque
funciones, rutas y relaciones sin leer archivo por archivo. Está instalada en
Claude y en Antigravity, pero **se usa solo a pedido**: el 2026-10-30 se le
quitaron los hooks y los bloques que obligaban a la IA a usarla en cada
sesión, porque gastaban tokens aunque el proyecto no estuviera indexado.

- **Versión instalada:** 0.8.1
- **Última disponible al 2026-10-30:** 0.12.1
- **Repositorio:** https://github.com/DeusData/codebase-memory-mcp

## Ver qué versión tienes

```powershell
codebase-memory-mcp --version
```

## Actualizar

Los comandos van en PowerShell, desde una carpeta que **no** sea un proyecto
(por ejemplo `Descargas`), para que el instalador no quede suelto dentro de un
repo.

1. Descargar el instalador:

```powershell
Invoke-WebRequest -Uri https://raw.githubusercontent.com/DeusData/codebase-memory-mcp/main/install.ps1 -OutFile install.ps1
```

2. Revisarlo antes de ejecutarlo:

```powershell
notepad install.ps1
```

3. Ejecutarlo:

```powershell
Unblock-File .\install.ps1; .\install.ps1
```

4. Borrar el instalador cuando termine:

```powershell
Remove-Item .\install.ps1
```

## Después de actualizar: revisar que no haya vuelto a meterse

El instalador puede volver a agregar lo que se quitó. Revisar estos lugares:

| Dónde | Qué buscar |
|---|---|
| `~/.claude/settings.json` | Hooks con `cbm-` en el comando |
| `~/.gemini/settings.json` | Hooks con el texto `codebase-memory` |
| `~/.gemini/GEMINI.md` y el `CLAUDE.md` de cada proyecto | Un bloque entre `<!-- codebase-memory-mcp:start -->` y `<!-- codebase-memory-mcp:end -->` |

Para revisarlo de una vez:

```powershell
Select-String -Path "$HOME\.claude\settings.json","$HOME\.gemini\settings.json","$HOME\.gemini\GEMINI.md" -Pattern "cbm-|codebase-memory"
```

Si aparece algo, pedirle a Claude que lo quite igual que la última vez: hooks
fuera de las dos configuraciones y bloque fuera de los archivos de reglas,
dejando el MCP registrado.

## Usarlo cuando haga falta

Sirve en proyectos grandes, donde buscar por texto no alcanza. Pedírselo a la
IA con palabras, por ejemplo: "indexa este proyecto con codebase-memory y
buscá quién llama a `X`". La primera vez tiene que indexar el proyecto.
