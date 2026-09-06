# AGENTS.md — usectx public kit

This repository is the **public Memory kit**, not the private engine (`op0ai/usectx-lab` / core). Do not clone core to attach Memory.

## Goal

Attach hosted usectx so the session can **lease search** (and hop `code_graph` when indexed). Fail closed without a workspace bearer.

## One path

1. Bearer: `usectx login` or https://app.op0.ai/ctx — never `/work`.
2. MCP: `https://ctx.op0.ai/mcp` with `Authorization: Bearer <token>` in the **client** config the user owns (`.cursor/mcp.json` or Claude Desktop). Pack `mcp.json` stays token-free.
3. Accept: `GET https://ctx.op0.ai/readyz` → `{"ok":true,"status":"ready","provider":"ctx","retrievalMode":"hybrid"}` (or `lexical` degraded).
4. Prove: MCP `search` `{ "query": "ready", "limit": 1 }` or `usectx ask "ready"`.

Install helpers (optional). Prefer git clone for content integrity; pin skills CLI + commit:

```bash
git clone --depth 1 https://github.com/op0ai/usectx.git
cd usectx && bash install.sh --global
usectx login --global
npx --yes skills@1.5.23 add op0ai/usectx@7269fe60fbe9e4cbf646dd6147f8339b8c924f67
```

CDN mirror of the same installer: `curl -fsSL https://op0.ai/usectx/install.sh | bash -s -- --global`.

## Session rules

Follow [`skills/usectx-session/SKILL.md`](skills/usectx-session/SKILL.md):

- **Start / before answer:** lease via `search`. If MCP `search` and CLI are missing → [`usectx-attach`](skills/usectx-attach/SKILL.md).
- **No bearer / 401 / lease refuse:** report refused. Do not invent memory. Do not widen tenant.
- **Named symbols:** hop `code_graph` ([`usectx-code-graph`](skills/usectx-code-graph/SKILL.md)).
- **Empty index + caller asked to fill:** [`usectx-extract`](skills/usectx-extract/SKILL.md) — honest about hosted bind vs local container.
- **End / settle:** call `ingestTranscriptProjection` only when `tools/list` includes it.

## Hosted vs local

| Need | Use |
| --- | --- |
| Stranger / Cursor / Claude / Codex / Grok | Hosted `https://ctx.op0.ai/mcp` |
| Local lab | `CTX_URL=http://127.0.0.1:4790` + stdio shim in this pack |
| Engine changes | Private lab — not this repo |

## Prompt

> Attach usectx memory from https://ctx.op0.ai/mcp using my workspace token, verify readiness at /readyz, and retrieve indexed project context.
