# Changelog

All notable changes to the **usectx public Memory kit** live here.

Engine work (buckets, doctor, native MCP door, extract container) ships in the private lab (`usectx-lab`) and is **not** versioned by this pack. This kit stays a thin attach / session / skills surface over hosted `https://ctx.op0.ai`.

## [0.4.2] — 2026-09-11

### Reconcile to Origin Empty-hook fail-closed contract

Replaces the thin 0.3.1 `{ allowed, reason }` surface with Origin kit **0.4.2** security semantics.

- **Canonical hook pack**: `hooks/hooks.json` + `hooks/usectx-hook.mjs`. Commands run via `node ./hooks/usectx-hook.mjs` (Node-on-PATH residual stays open). Repo-root `hooks.json` is kept identical for GH / Cursor project-root loaders.
- **`failClosed: true`** on `beforeSubmitPrompt` and `beforeMCPExecution` so crash / timeout / invalid JSON blocks the action.
- **Stdout contract** is `{ permission, continue }` (plus `user_message` on decisions). Never empty or null JSON — handler faults still emit a deny object.
- **`op0mt_` allowlist** unchanged: `agent_identity`, `action_invoke`, `packet_export`.
- **Workspace `clean` denied** for non-restricted tokens (orphan prune is not a default workspace MCP).
- **validate-hooks gate** now also requires `failClosed` on the two security events and resolves `node ./hooks/…` script paths.
- **Never disable security hooks.** Documented in `HOOKS.md`.

Delta vs 0.3.1: richer Cursor-native decision fields, fail-closed handler flags, Origin `hooks/` layout, and explicit `clean` deny. Same empty-command rejection and `op0mt_` catalog.

## [0.3.1] — 2026-09-11

### Security hooks & Cursor Empty-hook fix

- **Ship non-empty `hooks.json`**: declares `sessionStart`, `beforeSubmitPrompt`, `beforeMCPExecution`, and `sessionEnd` pointing to executable `./bin/usectx-hook.mjs`. Fixes native Cursor hook loader rejecting empty command declarations (`"Empty hook is not allowed"`).
- **Security hook handler (`bin/usectx-hook.mjs`)**:
  - Fail-closed JSON allow/deny output (never null or empty JSON).
  - Bearer requirement on session start, prompt submission, and MCP tool execution.
  - For `op0mt_` agent tokens, strictly restricts permitted tool catalog to `agent_identity`, `action_invoke`, and `packet_export`. All other tools fail closed cleanly.
- **Hook validation gate (`bin/usectx-validate-hooks.mjs`)**:
  - Static gate verifying that `hooks.json` exists, is valid JSON, contains all required hook events, and all handlers declare non-empty `command` strings referencing valid files.
  - Exposed via CLI `usectx validate-hooks` and enforced during `install.sh`.
- **Separate MCP client examples**:
  - `examples/cursor.mcp.json`: human/workspace token pattern (`CTX_HTTP_TOKEN`).
  - `examples/cursor.agent.mcp.json`: agent token pattern (`op0mt_`).
- **Safeguard docs**: Updated `HOOKS.md`, `README.md`, and `examples/README.md` to document the security model and remind operators to never disable security hooks or safeguards.

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
