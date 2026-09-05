# `@op0/ctx`

Context engine for usectx: leases, pocket_chunks, code_graph (Graphify), MCP search/health.

**Status:** scaffold stub. Real Effect-native sources live in private `op0ai/core` at `packages/ctx`.

## Local commands (stub)

```bash
bun run ctx:doctor
bun run ctx:inspect
bun run ctx:http          # http://127.0.0.1:4790
```

## Engines

| Piece | Pin | Role |
| --- | --- | --- |
| pggraph | **1.2.0** | graph / lexical substrate ([Evokoa](https://github.com/Evokoa)) |
| pgcontext | **0.3.0** (gap) | hybrid RRF — without it, retrieval is **degraded lexical** |
| Graphify | **0.9.53** | code_graph extract |

Compose: [`infra/compose.pgctx.yaml`](../../infra/compose.pgctx.yaml)

Import: [`scripts/import-from-core.md`](../../scripts/import-from-core.md)
