# usectx hooks and jobs

Kit **0.3.0** disclosed reference for the kit skills. Load when a skill points here. Engine/lab is out of band.

## Nouns

- **workspace**: tenant boundary
- **partition**: storage segment inside a workspace
- **sourceScope**: repo / branch / tree
- **raw** vs **processed**: input streams vs indexed evidence
- **Door**: validates the bearer and issues a **lease**
- **Lens**: demand projection across sessions
- **WorkSession**: transcript lifecycle

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
- `usectx extract` / `usectx ingest` / `usectx inspect` — posture helpers; extract/ingest tell honesty when the door is absent
