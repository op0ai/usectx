# Evidence snapshot — public kit + hosted door (2026-09-12)

Primer-run receipts. Not a Memory lease. Not a cord run.

## This checkout

| Field | Value |
| --- | --- |
| Repo | `op0ai/usectx` (public Memory kit) |
| Branch at write | `origin/main` |
| Commit | `a06b75b0f4a80e3a90f67e663288476842c5edbf` |
| Subject | Merge pull request #6 from op0ai/cursor/marketplace-packaging-9831 |
| Kit version | `0.4.2` (`VERSION`) |
| UTC | `2026-09-12T14:51:00Z` (probes) / `2026-09-12T14:51:38Z` (branch) |

Tracked files (complete `git ls-tree -r --name-only` at that SHA):

```
.claude-plugin/plugin.json
.cursor-plugin/mcp.json
.cursor-plugin/plugin.json
.github/workflows/ci.yml
.gitignore
.grok-plugin/marketplace.json
.grok-plugin/plugin.json
.mcp.json
AGENTS.md
CHANGELOG.md
HOOKS.md
LICENSE
README.md
RELEASE.md
VERSION
bin/usectx
bin/usectx-hook.mjs
bin/usectx-mcp-stdio.mjs
bin/usectx-token.mjs
bin/usectx-validate-hooks.mjs
docs/marketplace-submission.md
docs/marketplace/xai-official.entry.json
examples/README.md
examples/claude_desktop_config.json
examples/cursor.agent.mcp.json
examples/cursor.mcp.json
hooks.json
hooks/hooks.json
hooks/usectx-hook.mjs
install.sh
mcp.json
package.json
plugin.json
skills/usectx-attach/SKILL.md
skills/usectx-code-graph/SKILL.md
skills/usectx-extract/SKILL.md
skills/usectx-retrieve/SKILL.md
skills/usectx-session/SKILL.md
tests/hooks.test.mjs
tests/marketplace-manifests.test.mjs
```

Absent from this tree (searched): Foldkit, Pierre, Fate, TEA, Pack assemble, tokenizer T, desk UI, Signals nav, ledger, cord runner.

## Session lease

This cloud session had **no** workspace bearer (`CTX_HTTP_TOKEN` unset; `~/.op0/usectx/token` missing). MCP `search` was **not** in the client catalog. CLI `usectx ask` / `usectx search` therefore cannot run.

Label: **REFUSED** (missing bearer) — not “empty index.” Do not treat this primer as leased Memory.

`usectx whoami` (local CLI against hosted origin):

```
usectx whoami
origin      https://ctx.op0.ai
token       absent
token path  /home/ubuntu/.op0/usectx/token
```

`usectx inspect`: readiness 200, token unset.

## Hosted probes (no bearer)

| URL | HTTP | Body / note |
| --- | --- | --- |
| `GET https://ctx.op0.ai/readyz` | 200 | `{"ok":true,"status":"ready","provider":"ctx","retrievalMode":"hybrid"}` |
| `GET https://ctx.op0.ai/health` | 200 | `{"ok":true,"status":"live","provider":"ctx","note":"liveness probe; see /readyz for dependency readiness"}` |
| `GET https://ctx.op0.ai/try?q=ready` | 200 | `{"ok":true,"provider":"ctx","workspaceId":"try","retrievalMode":"hybrid","hitCount":0,"evidence":[]}` — public fixture, not tenant Memory |
| `POST https://ctx.op0.ai/mcp` `tools/list` | 401 | `{"error":"unauthorized"}` |
| `GET https://ctx.op0.ai/openapi.json` | 401 | `{"error":"unauthorized"}` |
| `GET https://ctx.op0.ai/v1/documents` | 401 | `{"error":"unauthorized"}` |
| `GET https://ctx.op0.ai/.well-known/mcp/server-card.json` | 200 | tools: `search`, `document_put`, `document_list`, `document_get`, `document_delete` |
| `GET https://ctx.op0.ai/llms.txt` | 200 | document CRUD + search; privileged `clean`; no GraphQL server |
| `GET https://ctx.op0.ai/.well-known/oauth-protected-resource` | 200 | resource `https://ctx.op0.ai/mcp`; authorization server `https://api.workos.com` |

Server-card (verbatim tool list):

```json
{
  "url": "https://ctx.op0.ai/mcp",
  "tools": ["search", "document_put", "document_list", "document_get", "document_delete"],
  "authentication": { "type": "bearer" }
}
```

`llms.txt` also states: no version history retained; `sourceVersion` is optimistic concurrency; stale write/delete → 409; `sourceUrl` on `document_put` is HTTPS metadata and is never fetched; executor plugins ingest foreign OpenAPI / GraphQL / MCP and do not serve GraphQL.

## Kit CLI honesty (no Host job)

```
$ node ./bin/usectx extract
usectx extract: local repository extraction requires an in-repo or self-hosted context container. Hosted background extraction is queued on repository bind.

$ node ./bin/usectx ingest
usectx ingest: append transcripts or documents to workspace evidence via MCP tool ingestTranscriptProjection.
```

Those commands print posture and exit 0. They do not extract, ingest, assemble, or run a cord.

## Catalog mismatch (kit text vs hosted card)

| Name | Kit tells agents | Public hosted card (this run) |
| --- | --- | --- |
| `search` | Yes — `skills/usectx-retrieve`, `bin/usectx` | Yes |
| `code_graph` | Yes — `skills/usectx-code-graph`, `usectx ask` | **Not listed** |
| `ingestTranscriptProjection` | Yes — `skills/usectx-session`, `usectx ingest` | **Not listed** |
| `health` | Yes — CLI + skills | Public HTTP `/health`; not on server-card tool list |
| `document_*` | **Not mentioned** in skills / CLI help | Yes — four tools |
| `agent_identity` / `action_invoke` / `packet_export` | Hook allowlist for `op0mt_` in `hooks/usectx-hook.mjs` | **Not listed** |
| `clean` | Hook-denied for workspace tokens; `HOOKS.md` job | Privileged on `llms.txt`; not on server-card |

Astra must call hosted `tools/list` **with a workspace bearer** on Day-0 and treat that list as law. This snapshot could not.

## Closed / merged history that matters

| PR | State | Why it matters |
| --- | --- | --- |
| [#1](https://github.com/op0ai/usectx/pull/1) Scaffold Bun monorepo + engine packages | CLOSED | Do not re-import `usectx-lab` / `core` into this public kit |
| [#2](https://github.com/op0ai/usectx/pull/2)–[#6](https://github.com/op0ai/usectx/pull/6) | MERGED | Attach, hooks 0.4.2, marketplace packaging — the LIVE kit surface |
