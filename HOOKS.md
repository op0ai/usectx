# usectx hooks and jobs

Kit **0.3.1** disclosed reference for the kit skills. Load when a skill points here. Engine/lab is out of band.

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

Cursor native agent execution validates `hooks.json` before start. Empty hooks (`"command": ""` or empty command arrays) are rejected by native execution (`"Empty hook is not allowed"`).

The public kit defines non-empty security hooks pointing to `./bin/usectx-hook.mjs`:

1. `sessionStart`: verifies bearer presence and readiness or refuses closed cleanly.
2. `beforeSubmitPrompt`: enforces bearer requirement before submitting prompts to the model.
3. `beforeMCPExecution`: fail-closed authorization gate for all MCP tool executions:
   - Requires valid bearer token.
   - For agent tokens (`op0mt_` prefix), strictly restricts tool access to:
     - `agent_identity`
     - `action_invoke`
     - `packet_export`
     All other tools are denied cleanly under `op0mt_`.
   - Always produces valid JSON (never empty or null).
4. `sessionEnd`: audit confirmation and clean shutdown.

### Validating Hooks

Run the validator gate:
```bash
usectx validate-hooks
# or directly:
node ./bin/usectx-validate-hooks.mjs hooks.json
```

## Jobs

- `extract` — source → code graph (local container or hosted repository bind)
- `ingestTranscriptProjection` — turns → evidence (MCP when catalog lists it)
- `resolveSettledEvidence` — pending → queryable
- `clean` — orphan prune (dry-run first)

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
- `usectx validate-hooks` — validate non-empty commands and hook contracts
- `usectx extract` / `usectx ingest` / `usectx inspect` — posture helpers; extract/ingest tell honesty when the door is absent
