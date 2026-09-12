# usectx

Memory kit for agents. Attach hosted MCP, lease search, hop the code graph.

Version **0.4.2** — see [CHANGELOG](CHANGELOG.md) / [RELEASE](RELEASE.md). No private `core` clone. Tokens never live in pack `mcp.json`. Engine/lab iterates separately (`usectx-lab`); this kit stays the thin public surface.

Hosted accept: [`GET https://ctx.op0.ai/readyz`](https://ctx.op0.ai/readyz) → `retrievalMode: hybrid`.

## Stranger path (install → login → MCP search)

You need a workspace bearer from [app.op0.ai/ctx](https://app.op0.ai/ctx) (or `usectx login`). Not `/work`. Without a bearer, leased search refuses — agents must not invent memory.

### 1 — Install (CLI + pack)

Verified install (git content-addressed):

```bash
git clone --depth 1 https://github.com/op0ai/usectx.git
cd usectx && bash install.sh --global
```

CDN convenience (same script; prefer clone for git integrity):

```bash
curl -fsSL https://op0.ai/usectx/install.sh | bash -s -- --global
```

### 2 — Login (mint bearer + optional home MCP)

```bash
usectx login --global
```

Writes `~/.op0/usectx/token` and home `~/.cursor/mcp.json` (Claude Desktop when present). Or skip the CLI and paste a bearer into client MCP only (step 3).

### 3 — MCP search (prove attach)

**Fastest without installer:** copy [`examples/cursor.mcp.json`](examples/cursor.mcp.json) → project `.cursor/mcp.json` (or home `~/.cursor/mcp.json`):

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

Replace `CTX_HTTP_TOKEN`. Reload MCP. Call `search` with `{ "query": "ready", "limit": 1 }` — or `usectx ask "ready"`.

Optional skills (Cursor / Claude Code / Codex / others):

```bash
npx --yes skills@1.5.23 add op0ai/usectx@v0.4.2
```

`skills-lock.json` is written by the skills CLI in the **consumer** project — not in this kit.

## Marketplace install

Same public repo: [`https://github.com/op0ai/usectx`](https://github.com/op0ai/usectx). Listings and publish steps: [`docs/marketplace-submission.md`](docs/marketplace-submission.md).

| Channel | After it is listed |
| --- | --- |
| **Cursor Marketplace** | Install from Cursor’s marketplace UI ([publish form](https://cursor.com/marketplace/publish) for maintainers) |
| **cursor.directory** | Community listing — [submit the repo URL](https://cursor.directory/plugins/new) |
| **Grok Build** | `/marketplace` once the SHA-pinned entry lands in [`xai-org/plugin-marketplace`](https://github.com/xai-org/plugin-marketplace). Direct: `grok plugin install op0ai/usectx` |

**Host `op0mt_` grants are required** for marketplace plugin MCP. Configure the Host-issued `op0mt_` token (Cursor: Plugins → Configure → `OP0MT_TOKEN`). **Never** put a workspace bearer (`ctx_ws_…` / `CTX_HTTP_TOKEN`) in plugin config or a listing.

CLI / hooks / stdio still prefer a workspace login: explicit `CTX_*` env, then saved project/home token, then `OP0MT_TOKEN` only if no workspace credential exists. A Host grant must not shadow `usectx ask` / `search`.

`op0mt_` is hook-restricted to hosted tools `agent_identity`, `action_invoke`, and `packet_export`. This GitHub kit does **not** ship `usectx agent` or `usectx packet` CLIs — those names exist only as door-side MCP tools, not as kit binaries. Leased `search` / `code_graph` stay on a workspace bearer in **your** client MCP (`usectx login` or [`examples/cursor.mcp.json`](examples/cursor.mcp.json)), not in the marketplace secret.

Manifests: Agent Plugin [`plugin.json`](plugin.json), Cursor [`.cursor-plugin/plugin.json`](.cursor-plugin/plugin.json), Grok [`.grok-plugin/plugin.json`](.grok-plugin/plugin.json).

### One agent prompt

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

Claude Code loads `.claude-plugin/plugin.json` and `skills/*/SKILL.md`. Agent Plugins root `plugin.json` + `mcp.json` ship for the same kit. Cursor Marketplace also reads `.cursor-plugin/plugin.json`; Grok Build reads `.grok-plugin/plugin.json`.

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
