# usectx

**Leased workspace Memory + MCP** on Evokoa **pgGraph / pgContext**, with **Graphify** for code graph.

This repo is a Bun monorepo:

| Path | What |
| --- | --- |
| **Repo root** | Public **agent kit** (plugin / skills / stdio MCP) — install UX unchanged |
| `packages/ctx` | Context engine (`@op0/ctx`) — Effect-native; scaffold until imported from core |
| `packages/context-contract` | Shared contracts — same |
| `infra/compose.pgctx.yaml` | Local **pggraph 1.2.0** |
| `docs/sota-gap.md` | Product lanes vs Mem0 / Letta / Zep / Polygres / Graphify |

Version **0.3.0-dev** (kit surface still **0.2.0** until the next kit cut). Tokens are never in `mcp.json`.

## Product door

1. **Hosted (stranger-runnable):** `https://ctx.op0.ai/mcp` after `usectx login`
2. **Local kit:** stdio shim `./bin/usectx-mcp-stdio.mjs` → your `CTX_URL`
3. **Local engine:** `bun run ctx:http` → `http://127.0.0.1:4790` (stub until core import)

Accept / posture:

```bash
usectx readyz          # kit → remote or CTX_URL
usectx inspect
bun run ctx:doctor     # engine pins + degradation honesty
bun run ctx:inspect
```

### Honest degradation

Without **pgcontext 0.3.0**, retrieval is **degraded lexical** on **pggraph 1.2.0**. We do not claim hybrid RRF until pgcontext is loaded. See [`docs/sota-gap.md`](docs/sota-gap.md) and [`infra/README.md`](infra/README.md).

## Kit install (unchanged)

Interactive (see the plan, confirm):

```bash
curl -fsSL https://op0.ai/usectx/install.sh -o install-usectx.sh
bash install-usectx.sh
```

Hanna / pipe (project-local `./usectx`, no home MCP):

```bash
curl -fsSL https://op0.ai/usectx/install.sh | bash
```

Home pack + global Cursor/Claude MCP (explicit):

```bash
curl -fsSL https://op0.ai/usectx/install.sh | bash -s -- --global
```

SKILL.md into the current project (`npx skills` does **not** login or write a bearer):

```bash
npx skills add op0ai/usectx
```

Then:

```bash
usectx login
```

Token path: `~/.op0/usectx/token`. View at https://app.op0.ai/ctx. Global MCP: `usectx login --global`.

## Local engine (monorepo)

```bash
bun install
bun run ctx:doctor
docker compose -f infra/compose.pgctx.yaml up -d   # pggraph 1.2.0
bun run ctx:http                                   # stub HTTP door :4790
```

Import real `@op0/ctx` from a local **op0ai/core** checkout: [`scripts/import-from-core.md`](scripts/import-from-core.md).  
**Blocker:** core is private — this repo ships scaffolds until someone with access runs that import.

## Skills

| Skill | Leading word | When |
| --- | --- | --- |
| `usectx-attach` | attach | wire MCP / login / bearer |
| `usectx-retrieve` | lease | search settled evidence |
| `usectx-code-graph` | hop | walk callers/callees |
| `usectx-extract` | extract | fill the index |

Claude Code loads `.claude-plugin/plugin.json` and `skills/*/SKILL.md`. It does not load Agent Plugins root `plugin.json`. Both layouts ship in this repo.

## MCP

`mcp.json` declares stdio (`./bin/usectx-mcp-stdio.mjs`) and hosted `https://ctx.op0.ai/mcp`. No `Authorization` header. Stdio reads `CTX_HTTP_TOKEN` or `~/.op0/usectx/token`.

## Catalog pins

| Package | Version |
| --- | --- |
| effect | 4.0.0-rc.112 |
| alchemy | 2.0.0-beta.74 |
| typescript | 7.0.2 |
| vite-plus | 0.3.0 |
| graphify (tool) | 0.9.53 (not npm — Graphify-Labs) |
| pggraph (image) | 1.2.0 |
| pgcontext | 0.3.0 (planned) |
