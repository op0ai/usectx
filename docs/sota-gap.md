# SOTA gap — where usectx sits

usectx is **not** trying to win by rewriting database engines. The product bet is a stranger-runnable **Memory door**: leases, receipts, MCP, and honest degradation — sitting on Evokoa **pgGraph / pgContext** and **Graphify** for code graph.

## Three lanes

### 1. Conversation memory (Mem0 / Letta / Zep)

| | Mem0 | Letta | Zep |
| --- | --- | --- | --- |
| Focus | Long-term memory extraction for agents | Stateful agent runtime + memory blocks | Temporal knowledge graphs over dialogue |
| Strength | Easy SDK attach; preference / fact memory | Agent loop + tools as first-class | Session/user timelines |
| Gap vs usectx | Weak on **repo code graph** and workspace leases | Runtime-centric, not a leased MCP context door | Conversation graph ≠ source code graph |

**usectx lane:** workspace-scoped **settled evidence** + leases, not a chat-memory SDK.

### 2. DB-as-context (Polygres)

| | Polygres | usectx |
| --- | --- | --- |
| Thesis | Put context/retrieval inside Postgres (pgrx) | Productize engines behind a Memory + MCP door |
| Engines | Own / ship graph+context extensions | **Depend honestly** on Evokoa **pgGraph** + **pgContext** — do not fork/rewrite pgrx |
| Door | Engine-forward | **MCP + CLI + kit** (`usectx login`, stdio shim, hosted `https://ctx.op0.ai/mcp`) |
| Trust | Engine capability | **Leases / receipts**, accept probes (`readyz`), **honest degradation** when hybrid is unavailable |

**Beat Polygres on productization / GTM**, not on inventing another pgrx stack.

### 3. Code graph (Graphify)

| | Graphify | usectx |
| --- | --- | --- |
| Role | Extract / hop structural code graph | Call Graphify for `code_graph`; store/serve via pggraph |
| Pin | **0.9.53** (current latest in core) | Same pin in this monorepo catalog |

usectx does not replace Graphify; it **doors** it next to leased hybrid/lexical search.

## usectx composition

```
Agent kit (repo root)          →  install.sh / npx skills / bin/usectx / mcp.json
        │
        ▼
MCP door (stdio or HTTP)       →  POST /mcp  (search, code_graph, health)
        │
        ▼
@op0/ctx engine                →  leases, pocket_chunks, receipts
        │
        ├── pggraph 1.2.0      →  graph + lexical substrate
        ├── pgcontext 0.3.0    →  hybrid RRF (GAP until available)
        └── Graphify 0.9.53    →  code_graph extract
```

## Honesty bar

- **Designed:** leased hybrid RRF (pgcontext) + code_graph walk.
- **Today without pgcontext:** **degraded lexical** on pggraph — say so in `readyz` / `doctor` / README. Do not claim hybrid.
- Live local core historically sat on **pggraph 1.0.0** lexical; this repo **pins pggraph 1.2.0** and plans **pgcontext 0.3.0**.

## What we refuse to pull in

Host, smolvm, cords, design-system, and other core apps stay out of this public repo. Only `packages/context-contract` + `packages/ctx` (+ the existing kit).
