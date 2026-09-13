# Eng-wave primer — gaps in *this* repo (2026-09-12)

Candid map of `op0ai/usectx` (public Memory kit **0.4.2**) versus the Foldkit + Pierre + Pack + cord acceptance. Primer only. No desk UI was implemented.

**Tree SHA:** `a06b75b0f4a80e3a90f67e663288476842c5edbf` (`origin/main`).  
**Probe receipts:** [`docs/evidence/2026-09-12-public-kit-hosted-snapshot.md`](../evidence/2026-09-12-public-kit-hosted-snapshot.md).

This cloud session had **no workspace bearer**. Hosted `/readyz` is ready; MCP `search` was not attached. Lease = **REFUSED**. Everything below is from the git tree, public hosted discovery, and public docs — not invented Memory hits.

## Labels

| Label | Meaning |
| --- | --- |
| **LIVE** | Code or a public hosted probe does the job today |
| **HALF** | A related surface exists but the acceptance criterion does not |
| **TALK** | Named in docs, hooks, or product locks — no implementation in this checkout |

Product locks are treated as law. Missing capability is stated bluntly.

## Architecture lanes (where this repo sits)

| Lane | In this checkout? | Reality |
| --- | --- | --- |
| op0 company | No | Account / token mint: `usectx login` talks to `https://app.op0.ai` (`bin/usectx`). Product UI `/work` is explicitly not a token path (`AGENTS.md`, `README.md`) |
| entirething palace | No | Zero palace / Foldkit / desk files |
| usectx context SDK | **HALF** | This repo is the **public attach kit** (CLI, skills, hooks, token-free MCP manifests). Public docs say there is **no published npm SDK** |
| cord execution | **TALK** | No runner. Hook allowlist names `action_invoke` / `packet_export`. Hosted server-card does not list them |

Private engine (`usectx-lab` / `core`) is out of band. [`CHANGELOG.md`](../../CHANGELOG.md) and [`RELEASE.md`](../../RELEASE.md) say so. Closed [PR #1](https://github.com/op0ai/usectx/pull/1) tried to scaffold engine packages here and was closed. **Do not reopen that shape.**

## Eng acceptance vs this tree

### 1. Snapshot select (git-backed Source)

**TALK.**

No Source type, no commit/tree picker, no snapshot object. The only git in this repo is the kit’s own history.

Closest nouns: `sourceScope` in [`HOOKS.md`](../../HOOKS.md) (repo / branch / tree) — vocabulary, not code. Hosted `document_put` may carry optional `sourceUrl` (HTTPS metadata, never fetched — `https://ctx.op0.ai/llms.txt`). That is not git snapshot select.

### 2. Pierre mount (trees + diffs)

**TALK.**

No Pierre. No tree widget. No diff viewer. Implementation files (CLI, hooks, skills, manifests, tests — excluding `docs/`) contain no `Pierre` / `Foldkit` / `Fate` / `TEA` references. Those names appear only in this primer.

Pierre trees+diffs are locked as the git UI primitive. They do not live here. Do not invent a substitute in this kit.

### 3. Pack assemble

**TALK** (name collision risk).

| Surface | What it actually is |
| --- | --- |
| `packet_export` | String in `OP0MT_ALLOWED_TOOLS` ([`hooks/usectx-hook.mjs`](../../hooks/usectx-hook.mjs)) |
| `usectx packet` CLI | Explicitly **not shipped** ([`README.md`](../../README.md), [`docs/marketplace-submission.md`](../marketplace-submission.md)) |
| Hosted server-card | No assemble / pack tool |
| Tokenizer T | **Absent.** No measured token labels. Do not print illustrative counts. Mark `est` only if a later assemble path exists and cannot measure |

`packet_export` ≠ Pack assemble. Do not treat the hook allowlist as a Host API.

### 4. Cord run (one real run)

**TALK.**

| Surface | What it actually is |
| --- | --- |
| `action_invoke` | Hook allowlist for `op0mt_` tokens only |
| `usectx agent` CLI | **Not shipped** |
| Hosted `llms.txt` | “Executor plugins ingest foreign OpenAPI / GraphQL / MCP. They do not serve GraphQL.” Ingress, not a desk Run button |
| Browser Run | **Unavailable** — no cord path in this kit. Mark honestly; do not ship a disabled-looking Run that pretends |

Signals = cord plugin/connector ingress only. This kit correctly has **no** Signals nav and **no** peer dashboard. Keep it that way.

### 5. Reviewed Memory save (Pass → Pack, actor + grant + revoke)

**HALF** at the Host document write; **TALK** for review / Pass / Pack / grant-revoke UX.

What exists:

- Bearer resolve + refuse-closed hooks ([`bin/usectx-token.mjs`](../../bin/usectx-token.mjs), [`hooks/usectx-hook.mjs`](../../hooks/usectx-hook.mjs))
- Hosted document tools on the public server-card: `document_put` / `list` / `get` / `delete`
- Authority text on `llms.txt`: workspace + principal on the bearer; request fields cannot override workspace; `clean` needs `workspace_admin` or `context_clean`
- Kit settle path: call `ingestTranscriptProjection` **only if** `tools/list` lists it ([`skills/usectx-session/SKILL.md`](../../skills/usectx-session/SKILL.md)). CLI `usectx ingest` **prints that sentence** and does not ingest ([`bin/usectx`](../../bin/usectx) `case "ingest"`)

What does not exist here:

- Inspect → edit draft → review → **explicit Save**
- Citations bound to **immutable git snapshots**
- Pass / Pack types
- Grant / revoke APIs
- A ledger that audits assemble / run / save

Hosted Memory retains **no document version history** (`llms.txt`). Latest write is `principalId` + `updatedAt` + `sourceVersion`. That is concurrency, not git.

Repo Save (git-backed Source persist) is **unavailable** until a git Source path exists. Do not add a Save that writes only to Memory and calls it a repo save.

### 6. Stale / current

**HALF** (Host 409) / **TALK** (git stale vs HEAD).

| Mechanism | Where | What it means |
| --- | --- | --- |
| `sourceVersion` + HTTP 409 | Hosted documents (`llms.txt`) | Optimistic concurrency on the **latest** Memory document. No history |
| Extract “empty or stale” | [`skills/usectx-extract/SKILL.md`](../../skills/usectx-extract/SKILL.md) | Skill language. CLI `usectx extract` does not compare HEAD to an index |
| Git snapshot vs working tree | — | Not implemented |

A desk “stale” chip that is not `git status` / `rev-parse` vs a cited SHA is fake. A Memory 409 is not “this file is not current.”

## Product-lock surfaces

| Lock | Label in this repo | Notes |
| --- | --- | --- |
| Git = durability rail for file/repo Sources | **TALK** | No Source adapter |
| Memory = authority rail for Pass→Pack | **HALF** | Lease/refuse + hosted document actor; no Pass/Pack |
| Ledger audits assemble/run/save — not a second git | **TALK** | `sessionEnd` hook is “audit confirmation” text only ([`hooks/usectx-hook.mjs`](../../hooks/usectx-hook.mjs) `handleSessionEnd`) |
| Desk loop = git Source select + Memory save + cord run | **TALK** | No desk |
| Pierre = git UI primitive | **TALK** | Not present |
| Signals = cord ingress only | **LIVE as absence** | No Signals product UI — keep it gone |
| Token labels measured at assemble or `est` | **TALK** | No tokenizer |
| Browser Run / repo Save gated on cord / git paths | **LIVE as absence** | Correctly missing; do not fake |
| Foldkit TEA web architecture | **TALK** | Not present |
| Fate never adopt | **LIVE as absence** | Not present — do not add |
| No decorative UI rewrite / no prod deploy | Honored this run | Docs only |

## What *is* LIVE (do not re-implement)

Use these. Do not rebuild them inside Foldkit.

| Capability | Paths |
| --- | --- |
| Hosted accept | `GET /readyz` — this run: hybrid. CLI: `bin/usectx` `readyz` |
| Workspace login | `bin/usectx` `login` → AuthKit device flow → `~/.op0/usectx/token` |
| Bearer order | `CTX_*` env → project/home token → `OP0MT_TOKEN` last ([`bin/usectx-token.mjs`](../../bin/usectx-token.mjs) `resolveCtxCliBearer`) |
| HTTP MCP attach | [`examples/cursor.mcp.json`](../../examples/cursor.mcp.json) (workspace); [`.cursor-plugin/mcp.json`](../../.cursor-plugin/mcp.json) (`${OP0MT_TOKEN}` only) |
| Stdio shim | [`bin/usectx-mcp-stdio.mjs`](../../bin/usectx-mcp-stdio.mjs) — forwards JSON-RPC; **holds no tool table** |
| Fail-closed hooks | [`hooks/hooks.json`](../../hooks/hooks.json), [`hooks/usectx-hook.mjs`](../../hooks/usectx-hook.mjs), [`tests/hooks.test.mjs`](../../tests/hooks.test.mjs) |
| Session skill | attach → lease `search` → refuse closed → hop → settle if catalog allows |
| Marketplace packaging | [`docs/marketplace-submission.md`](../marketplace-submission.md) — attach/lease only |

`usectx ask` ([`bin/usectx`](../../bin/usectx)) POSTs `code_graph` then `search` to `{origin}/mcp`. That is a **client**. If the door’s `tools/list` lacks `code_graph`, the call refuses. The public server-card on this run did **not** list `code_graph`.

## Hosted Memory vs kit copy (Astra will trip here)

Public discovery (`/.well-known/mcp/server-card.json`, `llms.txt`) advertises **document CRUD + `search`**.

Kit skills/CLI advertise **`search` + `code_graph` + `ingestTranscriptProjection`** and never mention `document_*`.

Kit hooks allow `op0mt_` only for **`agent_identity`, `action_invoke`, `packet_export`** — none of which appear on the public server-card.

Until Day-0 `tools/list` with a real grant, treat **both catalogs as claims**. Do not code against the skill markdown as if it were the door.

## Existing eng-opener docs

**None in this repo** before this primer. Nothing to restamp.

https://op0.ai/docs/usectx/ (page dated 2026-09-01) cites private-tree files such as `docs/plans/2026-08-12-prd-o6-canvas.md` and `packages/ctx/src/ctx-ask.ts`. Those paths are **not** in this checkout. **Do not invent Pen PDF or private PRD contents.** Refresh those SHAs from the private tree on a Mac that can see them.

Hosted discovery also names `usectx accept`, `usectx up`, and `scripts/install-usectx.sh` from a **core** checkout. This kit’s CLI has no `accept` / `up` / `bench` ([`bin/usectx`](../../bin/usectx) `printUsage`).

## Top gaps that block the Foldkit + Pierre + cord wave

1. **No Pierre / git Source selection** — cannot start the desk loop in this repo.
2. **No Pack assemble + tokenizer T** — cannot label tokens honestly; `packet_export` is not assemble.
3. **No cord run path** — `action_invoke` is a hook string; browser Run must stay unavailable.
4. **Kit ↔ hosted catalog drift** — Astra will call tools the door may not expose, or miss `document_*`.
5. **No reviewed Save on immutable snapshots** — Memory latest-write ≠ git history; no review step; grant/revoke/Pass not in kit.

## Recommended first code seam

**Not this repository.** Do not add Foldkit, Pierre, or a Run button to `op0ai/usectx`.

First seam: in the **palace / Foldkit** checkout (Mac, private), mount Pierre on a real git tree so a selected path emits `{ repo, commit, path }` (and tree SHA if you have it). Cite that snapshot into Memory Host using whatever `tools/list` actually returns for the workspace grant — today the only public write we can name is `document_put` (metadata `sourceUrl` is never fetched). Then — and only then — prove a real cord invoke is on the catalog before anyone draws Run.

Kit-side follow-up (optional, later, still not desk): align skills/CLI copy with hosted `tools/list` so this pack stops advertising tools the door does not list.
