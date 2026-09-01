# usectx hooks and lifecycle reference

This is the disclosed reference for [`usectx-memory`](SKILL.md). It defines the canonical data hierarchy, background jobs, session lifecycle hooks, and CLI operations.

## Canonical nouns

- **workspace**: Top-level tenant and security boundary (e.g. `ws_edgecity`).
- **partition**: Isolated storage segment within a workspace.
- **sourceScope**: Source repository, branch, or file tree scope.
- **raw**: Unprocessed input streams (transcripts, raw source blobs).
- **processed**: Indexed evidence revisions, chunk embeddings, and pgGraph nodes.
- **Lens**: Demand-driven context projection across work sessions.
- **Door**: Authoritative gatekeeper that validates workspace tokens and issues leases.
- **Lease**: Cryptographically signed capability granting retrieve clearance for a specific query and workspace.
- **WorkSession**: Durable execution cord and transcript lifecycle.

## Background jobs

- `extract`: Ingest and parse repository source into the structural code graph.
- `ingestTranscriptProjection`: Project conversation turns and tool transcripts into durable evidence chunks.
- `resolveSettledEvidence`: Reconcile and linearize pending evidence revisions into queryable index state.
- `clean`: Perform safe dry-run candidate identification and prune orphaned evidence.

## Session lifecycle hooks

Configure agent harness hooks to synchronize memory across session boundaries:

1. **SessionStart / Before Submit**:
   - Query `search` with the current prompt or task keywords to retrieve relevant evidence under the active lease.
   - Query `code_graph` for referenced symbols to load caller/callee structural edges into the active lens.
2. **SessionEnd / Turn Settle**:
   - Invoke `ingestTranscriptProjection` with completed task transcripts and decisions to record durable project evidence for future sessions.

## CLI operations

- `usectx ask "<query>"`: Run the full harness loop (structural graph walk plus hybrid RRF retrieve).
- `usectx extract`: Build code graph indices from local source roots.
- `usectx ingest`: Append transcripts or structured documents to workspace evidence.
- `usectx inspect`: Inspect local and hosted door, store, and graph readiness.
