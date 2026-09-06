# usectx

Memory kit for agents. Attach hosted MCP, lease search, hop the code graph.

Version **0.3.0**. No private `core` clone. Tokens never live in pack `mcp.json`.

Hosted accept: [`GET https://ctx.op0.ai/readyz`](https://ctx.op0.ai/readyz) → `retrievalMode: hybrid`.

## Stranger path (one attach)

You need a workspace bearer from [app.op0.ai/ctx](https://app.op0.ai/ctx) (or `usectx login`). Not `/work`.

### A — Cursor / Claude Desktop MCP only (fastest)

Write project `.cursor/mcp.json` (or home `~/.cursor/mcp.json`) with your token:

```json
{
  "mcpServers": {
    "usectx": {
      "url": "https://ctx.op0.ai/mcp",
      "headers": {
        "Authorization": "Bearer CTX_HTTP_TOKEN"
      }
    }
  }
}
```

Copy from [`examples/cursor.mcp.json`](examples/cursor.mcp.json). Replace `CTX_HTTP_TOKEN`. Reload MCP. Call `search`. No installer required.

### B — Install CLI + skills (few steps)

Verified install (git content-addressed):

```bash
git clone --depth 1 https://github.com/op0ai/usectx.git
cd usectx && bash install.sh --global
usectx login --global
npx --yes skills@1.5.23 add op0ai/usectx@7269fe60fbe9e4cbf646dd6147f8339b8c924f67
```

`login --global` writes `~/.cursor/mcp.json` (and Claude Desktop if present). Skills land for Cursor / Claude Code / Codex / others. `skills-lock.json` is written by the skills CLI in the **consumer** project — not in this kit.

CDN convenience (same script as this repo; prefer clone when you want git integrity):

```bash
curl -fsSL https://op0.ai/usectx/install.sh | bash -s -- --global
```

### C — One agent prompt

After skills or MCP are present:

> Attach usectx memory from https://ctx.op0.ai/mcp using my workspace token, verify readiness at /readyz, and retrieve indexed project context.

The agent follows [`skills/usectx-attach/SKILL.md`](skills/usectx-attach/SKILL.md), then [`usectx-session`](skills/usectx-session/SKILL.md).

## Hosted today (honest)

| Surface | Hosted `ctx.op0.ai` |
| --- | --- |
| `search` (leased) | Yes — door mints lease from bearer |
| `code_graph` | Yes — needs an extracted graph for the workspace |
| `health` / `/readyz` | Yes — public probes; MCP `health` needs bearer |
| `ingestTranscriptProjection` | When `tools/list` shows it — call only then |
| `extract` (local container) | No — local/lab only; hosted queues on repository bind |
| Unleased / wrong-tenant search | Refuse — never invent hits |

Optional local lab: set `CTX_URL=http://127.0.0.1:4790` and `ALLOW_LOOPBACK=1` for the installer/CLI. Pack stdio shim: `./bin/usectx-mcp-stdio.mjs` (reads `~/.op0/usectx/token`).

## Skills

| Skill | Leading word | When |
| --- | --- | --- |
| `usectx-attach` | attach | wire MCP / login / bearer |
| `usectx-session` | session | start → lease; refuse closed; settle ingest when available |
| `usectx-retrieve` | lease | search settled evidence |
| `usectx-code-graph` | hop | walk callers/callees |
| `usectx-extract` | extract | fill the index (local or bind) |

Claude Code loads `.claude-plugin/plugin.json` and `skills/*/SKILL.md`. Agent Plugins root `plugin.json` + `mcp.json` ship for the same kit.

## Install flags

```bash
# Verified: clone this repo, then:
bash install.sh                  # interactive plan + confirm (project-local ./usectx)
bash install.sh --global         # home pack + ~/.local/bin + home MCP

# CDN convenience (mirrors this repo):
curl -fsSL https://op0.ai/usectx/install.sh -o install-usectx.sh
bash install-usectx.sh
curl -fsSL https://op0.ai/usectx/install.sh | bash
curl -fsSL https://op0.ai/usectx/install.sh | bash -s -- --global
```

Token path: `~/.op0/usectx/token`. Docs: https://op0.ai/docs/usectx/
