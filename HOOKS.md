# usectx hooks and jobs

Kit **0.4.2** disclosed reference for the kit skills. Load when a skill points here. Engine/lab is out of band.

## Nouns

- **workspace**: tenant boundary
- **partition**: storage segment inside a workspace
- **sourceScope**: repo / branch / tree
- **raw** vs **processed**: input streams vs indexed evidence
- **Door**: validates the bearer and issues a **lease**
- **Lens**: demand projection across sessions
- **WorkSession**: transcript lifecycle

## Hook Safeguards & Security Model

**Never disable security hooks or safeguards.**

Cursor native agent execution validates hook commands before start. Empty hooks (`"command": ""` or empty command arrays) are rejected (`"Empty hook is not allowed"`). A crash, timeout, or invalid JSON on a `failClosed` hook blocks the action instead of failing open.

Canonical pack files:

- [`hooks/hooks.json`](hooks/hooks.json)
- [`hooks/usectx-hook.mjs`](hooks/usectx-hook.mjs)

Repo-root [`hooks.json`](hooks.json) is the same manifest so GH / Cursor project-root loaders stay aligned. Do not edit one without the other.

Commands run via `node ./hooks/usectx-hook.mjs` (Node-on-PATH residual: `node` must be on PATH). Handler stdout is always `{ "permission", "continue" }` JSON — never empty, never null.

1. `sessionStart`: verifies bearer presence or refuses closed.
2. `beforeSubmitPrompt` (`failClosed: true`): enforces bearer before prompt submission (`continue`).
3. `beforeMCPExecution` (`failClosed: true`): fail-closed authorization gate:
   - Requires a valid bearer.
   - `op0mt_` agent tokens are restricted to `agent_identity`, `action_invoke`, and `packet_export`.
   - Non-restricted workspace tokens may not invoke workspace `clean`.
   - Always produces valid `{ permission, continue }` JSON.
4. `sessionEnd`: audit confirmation and clean shutdown.

### Validating Hooks

```bash
usectx validate-hooks
# or directly:
node ./bin/usectx-validate-hooks.mjs hooks/hooks.json
```

The gate rejects empty commands, missing security events, missing hook scripts, and missing `failClosed: true` on `beforeSubmitPrompt` / `beforeMCPExecution`.

## Jobs

- `extract` — source → code graph (local container or hosted repository bind)
- `ingestTranscriptProjection` — turns → evidence (MCP when catalog lists it)
- `resolveSettledEvidence` — pending → queryable
- `clean` — orphan prune (dry-run first). Hook-denied for non-restricted workspace tokens.

## Hosted vs local (kit-facing)

| Capability | Hosted `https://ctx.op0.ai` | Local lab |
| --- | --- | --- |
| Accept `/readyz` | Public; expect `retrievalMode: hybrid` | Same contract on loopback |
| MCP `search` | Bearer; door mints lease | Bearer against `CTX_URL` |
| MCP `code_graph` | Bearer; needs extract/bind | Needs local extract |
| MCP ingest | Only if `tools/list` shows it | Same |
| Local extract CLI | Not from this kit alone | Context container required |
| Pack `mcp.json` tokens | Never | Never |

## Session hooks

- Start / before submit: **lease** (`search`) on the prompt; **hop** (`code_graph`) on named symbols
- Refuse: missing bearer, 401, or door refuse → report refused (not empty knowledge)
- End / settle: ingest completed transcripts when the tool exists — see `usectx-session`

## CLI

- `usectx login` — AuthKit; token at `~/.op0/usectx/token`
- `usectx login --global` — also write `~/.cursor/mcp.json` (and Claude if present)
- `usectx readyz` / `usectx health`
- `usectx whoami` — origin and workspace meta (no secret print)
- `usectx ask "<q>"` — hop then lease
- `usectx search "<q>"` — search indexed workspace evidence
- `usectx validate-hooks` — validate non-empty commands, failClosed, and hook contracts
- `usectx extract` / `usectx ingest` / `usectx inspect` — posture helpers; extract/ingest tell honesty when the door is absent

This pack does **not** ship `usectx agent` or `usectx packet` commands. Those names are hosted MCP tools on `op0mt_` grants (`agent_identity`, `action_invoke`, `packet_export`), not kit CLIs.

Marketplace Cursor Plugin MCP uses `${OP0MT_TOKEN}` (Host grant). Hooks resolve `OP0MT_TOKEN` the same way as `CTX_HTTP_TOKEN`. Never put a workspace bearer in marketplace plugin config. See [`docs/marketplace-submission.md`](docs/marketplace-submission.md).
