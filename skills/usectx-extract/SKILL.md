---
name: usectx-extract
description: Extract repository source or ingest transcripts into usectx when the index is empty or stale.
---

# Extract

Jobs that fill the store. Retrieve and hop read what these write.

If `usectx` is not on PATH and MCP extract/ingest is missing, **attach** first — [`../usectx-attach/SKILL.md`](../usectx-attach/SKILL.md). Do not login here.

## Hosted honesty

| Job | Hosted `ctx.op0.ai` | Local lab |
| --- | --- | --- |
| Source → code graph | Queued on **repository bind** — not a laptop container from this kit | `usectx extract` needs an in-repo/self-hosted context container |
| Transcript → evidence | MCP `ingestTranscriptProjection` **when** `tools/list` includes it | Same tool against local `CTX_URL` |
| `search` / `code_graph` | Read path — do not extract just because search was empty | Same |

Do not claim hosted extract finished from this public kit alone.

## 1. Choose the job

- Source → structural graph: hosted bind path, or local `usectx extract` when a container exists.
- Transcript / decisions → evidence: MCP `ingestTranscriptProjection` if listed.

**Done when:** one job is named. Do not extract because a search returned nothing unless the caller asked to fill the index.

## 2. Run

Confirm the tool exists (`tools/list`) before calling ingest. Ingest takes completed transcripts, not raw secrets.

Local extract without a container: stop and say the requirement — do not invent a graph.

**Done when:** CLI or tool reports queued/finished, states the hosted bind path, or honestly unavailable.

## 3. Probe after

```bash
usectx readyz
```

Then hop or lease again ([`../usectx-session/SKILL.md`](../usectx-session/SKILL.md)).

**Done when:** `/readyz` is ready and a follow-up hop or lease is no longer an empty index miss (or the miss is explained).

Job names and session hooks: [`../../HOOKS.md`](../../HOOKS.md).
