# Import `@op0/ctx` + `@op0/context-contract` from op0ai/core

## Blocker

`op0ai/core` is **private**. This cloud agent’s GitHub token could not read
`https://github.com/op0ai/core` (API 404/403). The packages in this monorepo are
**scaffolds** with correct names, catalog pins, and an honest degraded posture.

## Exact paths to copy

From a local core checkout (`$CORE`):

| Source (core) | Destination (usectx) |
| --- | --- |
| `$CORE/packages/context-contract/` | `packages/context-contract/` |
| `$CORE/packages/ctx/` | `packages/ctx/` |

Do **not** copy:

- `packages/host`, smolvm, cords, design-system, or other apps
- Secrets, `.env*`, deploy keys, Alchemy production config

## Suggested commands

```bash
CORE="${CORE:-$HOME/src/core}"   # your local core path
USECTX="$(pwd)"                  # this repo root

# Replace scaffold trees (keep usectx package.json catalog pins if they diverge)
rsync -a --delete \
  --exclude node_modules --exclude dist --exclude .turbo \
  "$CORE/packages/context-contract/" \
  "$USECTX/packages/context-contract/"

rsync -a --delete \
  --exclude node_modules --exclude dist --exclude .turbo \
  "$CORE/packages/ctx/" \
  "$USECTX/packages/ctx/"
```

Then:

```bash
bun install
bun run typecheck
bun run ctx:doctor
```

## Pin alignment (do not silently regress)

| Dep | usectx catalog / compose |
| --- | --- |
| effect | `4.0.0-rc.112` |
| alchemy | `2.0.0-beta.74` |
| typescript | `7.0.2` |
| vite-plus | `0.3.0` (match cmdbase 0.3.0 — **not** core’s stale 0.2.5) |
| graphify (tool) | `0.9.53` (Graphify-Labs; not an npm catalog entry) |
| pggraph image | `ghcr.io/evokoa/pggraph:1.2.0` |
| pgcontext | **0.3.0** — plan only; compose notes the gap |

After import, bump workspace package versions only when core’s package versions change; keep root `catalog` as the single pin source.

## Compose path note

Core historically referenced `infra/self-host/compose.pgctx.yaml`.
This repo ships `infra/compose.pgctx.yaml`. Update any imported paths that still
point at `infra/self-host/...`.

## Kit stays at repo root

Public install UX (`install.sh`, `npx skills add op0ai/usectx`, `plugin.json`,
`skills/`, `bin/`, `mcp.json`) remains at the **repository root**. Do not move
those into packages/ without a compatibility shim.
