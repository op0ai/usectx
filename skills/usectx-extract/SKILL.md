---
name: usectx-extract
description: Extract repository source or ingest transcripts into usectx when the index is empty or stale.
---

# Extract

Jobs that fill the store. Retrieve and hop read what these write.

If `usectx` is not on PATH and MCP extract/ingest is missing, **attach** first — [`../usectx-attach/SKILL.md`](../usectx-attach/SKILL.md). Do not login here.

## 1. Choose the job

- Source → structural graph: `usectx extract` or MCP extract on bind.
- Transcript / decisions → evidence: MCP `ingestTranscriptProjection`.

**Done when:** one job is named. Do not extract because a search returned nothing unless the caller asked to fill the index.

## 2. Run

Local extract needs a context container. Hosted extract queues on repository bind. Ingest takes completed transcripts, not raw secrets.

**Done when:** the CLI or tool reports queued or finished, or states the hosted bind path.

## 3. Probe after

```bash
usectx readyz
```

Then hop or lease again.

**Done when:** `/readyz` is ready and a follow-up hop or lease is no longer an empty index miss.

Job names and session hooks: [`../../HOOKS.md`](../../HOOKS.md).
