---
name: usectx-attach
description: Attach usectx when MCP search, CLI retrieve, or a workspace bearer is missing.
---

# Attach

Wire hosted Memory so the session can lease. Bearer lives in `~/.op0/usectx/token` or `CTX_HTTP_TOKEN` — never in pack `mcp.json`.

No private core clone. Prefer hosted `https://ctx.op0.ai/mcp`. Optional local lab only when the user asks.

## 1. Prefer MCP-only (stranger)

If the user already has a workspace token (https://app.op0.ai/ctx — not `/work`):

Write **client** config they own — project `.cursor/mcp.json` after they ask, or home `~/.cursor/mcp.json` with `--global` / explicit home consent:

```json
{
  "mcpServers": {
    "usectx": {
      "url": "https://ctx.op0.ai/mcp",
      "headers": {
        "Authorization": "Bearer <TOKEN>"
      }
    }
  }
}
```

Same block for Claude Desktop (`claude_desktop_config.json`). Examples: [`../../examples/cursor.mcp.json`](../../examples/cursor.mcp.json).

**Done when:** MCP `tools/list` shows `search` (and usually `code_graph`, `health`).

## 2. Or install CLI + login

Verified (git):

```bash
git clone --depth 1 https://github.com/op0ai/usectx.git
cd usectx && bash install.sh --global
usectx login --global
```

CDN convenience (mirrors this repo): `curl -fsSL https://op0.ai/usectx/install.sh | bash -s -- --global`.

Piped without `--global` stays project-local (`./usectx`) and does not write home MCP. Skills only (pinned CLI + commit; does not login):

```bash
npx --yes skills@1.5.23 add op0ai/usectx@7269fe60fbe9e4cbf646dd6147f8339b8c924f67
```

**Done when:** `test -f "$HOME/.op0/usectx/token"` or `CTX_HTTP_TOKEN` is set, and `command -v usectx` or `./usectx/bin/usectx` works.

## 3. Stdio alternative (pack on disk)

```json
{
  "mcpServers": {
    "usectx": {
      "command": "node",
      "args": ["<pack>/bin/usectx-mcp-stdio.mjs"]
    }
  }
}
```

No token in JSON. Process reads `CTX_HTTP_TOKEN` or `~/.op0/usectx/token`. Local lab: `CTX_URL=http://127.0.0.1:4790`.

## 4. Probe + prove

```bash
curl -sS https://ctx.op0.ai/readyz
usectx readyz
```

**Done when:** HTTP 200 with `{"ok":true,"status":"ready","provider":"ctx"}` and `retrievalMode` `hybrid` or `lexical`.

Call MCP `search` `{ "query": "ready", "limit": 1 }` or `usectx ask "ready"`.

**Done when:** ranked hits or honest empty. On 401 / missing tool → stay here. Do not skip to lease fiction.

Next: [`../usectx-session/SKILL.md`](../usectx-session/SKILL.md).
