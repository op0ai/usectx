---
name: usectx-memory
description: Harness-embedded retrieve, door lease management, and code graph navigation through the usectx MCP. Use when attaching usectx memory, retrieving indexed project context, or querying the code graph.
---

# usectx memory

Infinite window is the **harness**: an embedded **retrieve** loop over settled evidence via the usectx MCP, CLI, and lifecycle hooks. The **door** validates the caller's workspace authority and issues a **lease** for every query. A **lens** focuses context demand across work sessions.

## Execution steps

Follow these steps in order to connect your agent to usectx memory:

### 1. Probe service readiness

Send a probe request to verify service availability and retrieval mode:

```bash
curl -sS https://ctx.op0.ai/readyz
```

**Completion criterion:** Response returns HTTP 200 with JSON payload `{"ok":true,"status":"ready","provider":"ctx","retrievalMode":"hybrid"}` (or `"retrievalMode":"lexical"` in degraded mode).

### 2. Configure attach with workspace bearer token

Verify that `CTX_HTTP_TOKEN` is available in your environment or configuration.

If `CTX_HTTP_TOKEN` is not present:

1. Run `usectx login` to authenticate with WorkOS AuthKit and automatically configure your `.cursor/mcp.json` and CLI token.
2. Alternatively, sign in to [app.op0.ai/ctx](https://app.op0.ai/ctx) (or [app.op0.ai](https://app.op0.ai) — accounts from allowlisted domains such as `@edgecity.live` receive instant workspace access) to view your token.
3. Write the remote MCP server definition to `.cursor/mcp.json` (or `~/.cursor/mcp.json`):

```json
{
  "mcpServers": {
    "usectx": {
      "url": "https://ctx.op0.ai/mcp",
      "headers": {
        "Authorization": "Bearer <TOKEN>"
      }
    }
  }
}
```

**Completion criterion:** Tool discovery succeeds (`tools/list` returns the catalog) or invoking the `health` tool returns `{ ok: true }`.

### 3. Retrieve evidence and traverse the code graph

Query the indexed memory and structural graph under the door lease:

- Call `search` with `{ "query": "<search query>" }` for hybrid RRF retrieval over settled evidence chunks. The door automatically attaches a workspace lease when omitted.
- Call `code_graph` with `{ "symbol": "<symbol>", "depth": 2, "direction": "any" }` to walk structural dependency edges in pgGraph.

**Completion criterion:** Tool returns ranked evidence chunks or an honest empty result (`ROOTS` list when a symbol is not indexed).

## Disclosed reference

For canonical data hierarchies (workspace, partition, sourceScope), raw versus processed lifecycles, background jobs, session lifecycle hooks, and CLI commands (`usectx ask`, `usectx extract`, `usectx ingest`), consult [`HOOKS.md`](HOOKS.md).
