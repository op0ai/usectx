---
name: usectx-session
description: Run a usectx agent session — lease search on start, refuse without lease, hop symbols, settle ingest when the catalog allows.
---

# Session

Agent-session loop over hosted Memory (kit **0.4.2**). Infinite context is leased retrieve, not a bigger window.

If MCP `search` is missing and `usectx` is not on PATH → **attach** first — [`../usectx-attach/SKILL.md`](../usectx-attach/SKILL.md).

## Hosted catalog (today)

| Tool / job | Expect on `ctx.op0.ai` |
| --- | --- |
| `search` | Yes — door attaches lease from workspace bearer |
| `code_graph` | Yes — empty/`ROOTS` if not extracted |
| `health` | Yes |
| `ingestTranscriptProjection` | Only if `tools/list` includes it |
| Local `extract` container | No on hosted — bind queue or local lab |

Always call `tools/list` (or rely on the client catalog) before assuming ingest/extract exist.

## 1. Start — lease

Before answering from “memory”, call MCP `search`:

```json
{ "query": "<user question or task>", "limit": 5 }
```

Omit any client-invented lease field. The door mints from the bearer.

CLI: `usectx ask "<question>"` (hop then lease).

**Done when:** ranked chunks return, or honest empty (no fabricated memory).

## 2. Refuse closed

| Signal | Action |
| --- | --- |
| No bearer / MCP not attached | Attach — do not search ambient files as Memory |
| HTTP 401 / unauthorized | Report refused; do not retry with another tenant’s token |
| Lease / door refuse | Report refused — **not** “nothing in memory” |
| Empty evidence with valid lease | Say the store has nothing for this query |

Wrong or missing bearer → refuse, do not widen.

**Done when:** a refused call is labeled refused.

## 3. Hop when structural

Named symbol / “what calls X” → [`../usectx-code-graph/SKILL.md`](../usectx-code-graph/SKILL.md). Lexical “what do we know” stays on lease ([`../usectx-retrieve/SKILL.md`](../usectx-retrieve/SKILL.md)).

## 4. Fill only when asked

Empty index is not automatic extract. If the caller asks to index source or ingest transcripts → [`../usectx-extract/SKILL.md`](../usectx-extract/SKILL.md).

## 5. Settle (end of turn / session)

When `tools/list` includes `ingestTranscriptProjection`, project **completed** turns and decisions — not raw secrets, not speculative drafts.

If the tool is absent on hosted today: say so; do not pretend ingest ran.

**Done when:** ingest reported queued/finished, or honestly unavailable.

Nouns and jobs: [`../../HOOKS.md`](../../HOOKS.md).
