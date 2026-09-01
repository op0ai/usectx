# usectx hooks and jobs

Disclosed reference for the kit skills. Load when a skill points here.

## Nouns

- **workspace**: tenant boundary
- **partition**: storage segment inside a workspace
- **sourceScope**: repo / branch / tree
- **raw** vs **processed**: input streams vs indexed evidence
- **Door**: validates the bearer and issues a **lease**
- **Lens**: demand projection across sessions
- **WorkSession**: transcript lifecycle

## Jobs

- `extract` — source → code graph
- `ingestTranscriptProjection` — turns → evidence
- `resolveSettledEvidence` — pending → queryable
- `clean` — orphan prune (dry-run first)

## Session hooks

- Start / before submit: **lease** (`search`) on the prompt; **hop** (`code_graph`) on named symbols
- End / settle: ingest completed transcripts and decisions

## CLI

- `usectx login` — AuthKit; token at `~/.op0/usectx/token`
- `usectx login --global` — also write `~/.cursor/mcp.json` (and Claude if present)
- `usectx readyz` / `usectx health`
- `usectx ask "<q>"` — hop then lease
- `usectx extract` / `usectx ingest` / `usectx inspect`
