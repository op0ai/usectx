# Changelog

All notable changes to the **usectx public Memory kit** live here.

Engine work (buckets, doctor, native MCP door, extract container) ships in the private lab (`usectx-lab`) and is **not** versioned by this pack. This kit stays a thin attach / session / skills surface over hosted `https://ctx.op0.ai`.

## [0.3.0] — 2026-09-06

### Memory kit for agents

Attach hosted Memory in one login. Agents lease search; they do not invent a bigger window.

### What works

- **Session attach** for Cursor, Claude Desktop, Claude Code, Codex, and similar harnesses
- **`usectx-session`** skill: lease on start, refuse closed (no bearer / 401 / door refuse), hop `code_graph` for named symbols, settle ingest only when `tools/list` lists it
- **`usectx-attach`** skill: MCP-only wiring or CLI `login`
- Hosted MCP at `https://ctx.op0.ai/mcp` (bearer owned by the **client** config — never pack `mcp.json`)
- Accept probe: `GET https://ctx.op0.ai/readyz` → `ok` + `retrievalMode` `hybrid` (or `lexical` degraded)
- Install: `install.sh` / CDN mirror; skills via pinned `npx skills add op0ai/usectx@…`
- CLI: `login`, `readyz`, `whoami`, `ask`, `search`, posture helpers for extract/ingest

### What needs `usectx login` (or a workspace bearer)

- Any leased `search` / `ask` / MCP Memory call
- Writing home MCP (`usectx login --global` → `~/.cursor/mcp.json` and Claude Desktop when present)
- Token path: `~/.op0/usectx/token` or `CTX_HTTP_TOKEN`
- Mint at [app.op0.ai/ctx](https://app.op0.ai/ctx) — not `/work`

### Honest limits

- This repo is the **public kit**, not the engine. Lab/engine iterates separately.
- Hosted `extract` is bind/queue — not a local container from this pack alone.
- `ingestTranscriptProjection` only when the hosted catalog exposes it.
- Empty index → honest empty; never fabricates hits.

### Stranger path

1. Install (optional): `git clone … && bash install.sh --global`
2. Login: `usectx login --global` (or paste bearer into client MCP)
3. Prove: MCP `search` `{ "query": "ready", "limit": 1 }` or `usectx ask "ready"`

## [0.2.0] — 2026-09-01

- Split skills (`attach`, `retrieve`, `code-graph`, `extract`)
- Consent-aware installer; Claude adapter / `.claude-plugin`
- Piped curl stays project-local; `--global` for home pack + MCP

## [0.1.0] — initial

- Initial public harness pack release
