---
name: usectx-attach
description: Attach usectx when MCP search, CLI retrieve, or a workspace bearer is missing.
---

# Attach

Install the CLI, login, wire MCP. Bearer lives in `~/.op0/usectx/token` or `CTX_HTTP_TOKEN` — never in pack `mcp.json`.

## 1. Install CLI

```bash
curl -fsSL https://op0.ai/usectx/install.sh | bash
```

Interactive plan + confirm: save the script, then `bash install.sh`. Home MCP: `bash install.sh --global`. Already unpacked: `export PATH="$PWD/usectx/bin:$PATH"` or `~/.op0/usectx/bin`.

**Done when:** `command -v usectx` succeeds, or `test -x ./usectx/bin/usectx` or `test -x "$HOME/.op0/usectx/bin/usectx"`.

## 2. Login

```bash
usectx login
```

Token path: `~/.op0/usectx/token`. Or open https://app.op0.ai/ctx and `export CTX_HTTP_TOKEN=...`. Global Cursor/Claude MCP only with `usectx login --global`.

**Done when:** `test -f "$HOME/.op0/usectx/token"` or `CTX_HTTP_TOKEN` is set.

## 3. Wire MCP

Hosted door: `https://ctx.op0.ai/mcp`. Client config the user owns may carry `Authorization: Bearer <token>`. Pack manifests do not.

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

Project file: `$PWD/.cursor/mcp.json` after the user asks. Home: `~/.cursor/mcp.json` only with `--global`. Stdio alternative: `node <pack>/bin/usectx-mcp-stdio.mjs` (reads the stored token).

**Done when:** MCP `tools/list` returns the catalog, or `health` returns `{ "ok": true }`.

## 4. Probe

```bash
curl -sS https://ctx.op0.ai/readyz
usectx readyz
```

**Done when:** HTTP 200 with `{"ok":true,"status":"ready","provider":"ctx"}` and `retrievalMode` `hybrid` or `lexical`.

## 5. Prove retrieve

Call MCP `search` with `{ "query": "ready", "limit": 1 }`, or `usectx ask "ready"`.

**Done when:** the agent can call MCP `search` or CLI retrieve (ranked hits or an honest empty). If either door is missing, stay on this skill — do not skip to lease or hop.
