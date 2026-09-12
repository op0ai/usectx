# Git vs Memory — eng implications (2026-09-12)

Product lock (law): **Git is the durability rail for file/repo Sources. Memory is the authority rail for Pass→Pack under actor+grant+revoke. A ledger audits assemble/run/save — it is not a second git.**

This note is for the next engineer (Astra / Codex on Mac). It is derived from this public kit plus hosted discovery on 2026-09-12. It does **not** reconstruct private Pen / PRD text.

Companion: [`2026-09-12-eng-wave-primer-gaps.md`](2026-09-12-eng-wave-primer-gaps.md), [`../evidence/2026-09-12-public-kit-hosted-snapshot.md`](../evidence/2026-09-12-public-kit-hosted-snapshot.md).

## Two rails

```
git object        Memory Host
─────────         ───────────
blob / tree       document / evidence (latest write)
commit SHA        sourceVersion (OCC token, not history)
working tree      not a thing
diff / blame      not a thing
push / fetch      grant / revoke / lease / actor
Pierre UI         search + (maybe) document_* ; not a file editor of record
```

If a feature needs **history, blame, revert, or a citation that still means the same bytes next week**, it calls **git**.

If a feature needs **who may Pass, what was packed, whether the actor is still granted**, it calls **Memory Host**.

If a feature needs **“did we assemble / run / save”**, it writes a **ledger event**. It does not `git commit` the run, and it does not store the git tree inside Memory as a pretend VCS.

## What must call git

Do this in the palace / Foldkit / Pierre process (not in this kit). Use the git CLI or libgit. Do not reimplement object storage in Memory.

| Job | Call | Do not |
| --- | --- | --- |
| Identify a file/repo Source | `rev-parse HEAD`, tree SHA, path, optional `ls-tree` | Invent a snapshot id |
| Show trees + diffs | Pierre (locked) on git objects | Roll a second tree widget; do not adopt Fate |
| Edit a file Source | inspect snapshot → **draft** (working tree or explicit draft ref) → review → **explicit Save** that creates a git object | Silent Memory overwrite as “save” |
| Cite a line / hunk | Immutable git SHA + path + range | Cite Memory `updatedAt` as if it were a commit |
| Repo Save | git commit / write that the operator reviewed | `document_put` alone |
| Stale vs current (files) | cited SHA vs `HEAD` / worktree | Memory 409 |
| Browser Run gate | exists only after a **cord path** exists | A Run control that shells git |

This public kit does none of the above. It is itself a git repo. That is irrelevant to product Sources.

## What must call Memory Host

Door: `https://ctx.op0.ai` (or `CTX_URL` loopback for lab). Bearer from `usectx login` / `CTX_HTTP_TOKEN` / Host `op0mt_` — never pack `mcp.json`.

Public hosted catalog **this run** (no bearer; server-card): `search`, `document_put`, `document_list`, `document_get`, `document_delete`. Full catalog requires Day-0 `tools/list`.

| Job | Call | Do not |
| --- | --- | --- |
| Attach / lease retrieve | MCP `search` (door mints lease from bearer). Kit client: [`bin/usectx`](../../bin/usectx), [`skills/usectx-retrieve/SKILL.md`](../../skills/usectx-retrieve/SKILL.md) | Grep the laptop and call it Memory |
| Prove the door | `GET /readyz` (public). MCP `health` if listed | Treat `/readyz` as a search |
| Write tenant documents | Hosted `document_*` **if** `tools/list` lists them. Actor = bearer workspace + principal (`llms.txt`) | Override workspace in the JSON body |
| Revise / delete | `expectedVersion` / `sourceVersion`; 409 = stale **document**, not stale git | Assume version history (Host says none) |
| Privileged orphan prune | `clean` only with configured partition + `workspace_admin` or `context_clean`. Kit hooks **deny** workspace `clean` ([`hooks/usectx-hook.mjs`](../../hooks/usectx-hook.mjs)) | Expose clean on the desk |
| Pass → Pack authority | **Not in this kit.** Must be Host grant/revoke. Until `tools/list` shows it, it does not exist | Invent Pass/Pack types in Foldkit localStorage |
| Settle a finished turn | `ingestTranscriptProjection` **only if** listed ([`skills/usectx-session/SKILL.md`](../../skills/usectx-session/SKILL.md)) | Dump raw secrets or speculative drafts |
| Hop structure | `code_graph` **only if** listed ([`skills/usectx-code-graph/SKILL.md`](../../skills/usectx-code-graph/SKILL.md)). Public card did not list it this run | Paste repo-wide grep as a graph walk |
| Agent-scoped Host grant | `op0mt_` → hook allowlist `agent_identity`, `action_invoke`, `packet_export` only | Use `op0mt_` for `search` when a workspace login exists (resolver must not let the Host grant shadow `CTX_*` / saved login) |

Stdio shim ([`bin/usectx-mcp-stdio.mjs`](../../bin/usectx-mcp-stdio.mjs)) forwards envelopes. It does **not** decide the catalog. The door does.

## What must not be invented

| Temptation | Why it is illegal / fake |
| --- | --- |
| Memory as git | Host: “No version history is retained.” Latest write only |
| Git as Memory | Commits are not grants. A SHA is not a Pass |
| Ledger as git | Ledger answers assemble/run/save. It does not store file bytes |
| Fake token counts | Measure at assemble with tokenizer **T**, or mark `est`. This kit has neither |
| Illustrative citations | Citations stick to **immutable snapshots**. Working-tree edits are drafts until Save |
| Signals dashboard / Signals nav | Ingress is cord plugin/connector only |
| Fate | Never adopt |
| Browser Run / repo Save without paths | Unavailable until cord / git Source exist — say so in the UI, or omit the control |
| `packet_export` = Pack assemble | Hook allowlist string only in this repo |
| `action_invoke` = proven cord run | Same. Prove via `tools/list` + one real invocation receipt |
| `/try` as tenant Memory | Public fixture workspace (`workspaceId: "try"`). This run: `hitCount: 0` for `q=ready` |
| 401 / missing bearer as “empty memory” | **REFUSED.** [`skills/usectx-retrieve/SKILL.md`](../../skills/usectx-retrieve/SKILL.md) |
| Widen tenant | Wrong bearer → refuse. Do not retry another workspace |
| Engine clone into this kit | Closed PR #1. Attach hosted MCP; do not vendor `core` |
| Desk UI in `op0ai/usectx` | Wrong lane. This pack stays thin |

## Pierre edit contract (when Pierre exists)

Not in this repo. When it does:

1. **Inspect** an immutable snapshot (git).
2. **Edit a draft** (worktree or named draft). Citations on screen still point at the snapshot you inspected.
3. **Review** the diff (Pierre).
4. **Explicit Save** writes git. Only then may a Memory save cite the new SHA.

A Memory `document_put` that pastes file bytes without a git SHA is **not** a repo Save. Optional `sourceUrl` on the Host is HTTPS metadata and is **never fetched** — it cannot substitute `git show`.

## Assemble / run / save (the desk loop)

```
Pierre: select git Source snapshot(s)
    → Memory Host: assemble Pack (actor + grant)
        → token labels: measure(T) or est
    → cord: one real run (plugin ingress, not Signals nav)
    → ledger: assemble / run / save events
    → Memory: reviewed save citing the same SHAs
    → git: only if the operator explicitly saved file Sources
```

**None of the middle arrows exist in this public kit.** Hosted document CRUD is a possible **write** primitive, not assemble, not run, not a ledger.

## Kit files that already encode the split

| File | Implication |
| --- | --- |
| [`AGENTS.md`](../../AGENTS.md) | This repo attaches Memory. It is not the engine |
| [`HOOKS.md`](../../HOOKS.md) | Nouns: workspace, partition, sourceScope, Door, Lens, WorkSession. Jobs: extract, ingest, resolve, clean |
| [`bin/usectx-token.mjs`](../../bin/usectx-token.mjs) | Workspace credential beats Host grant for CLI/stdio |
| [`hooks/usectx-hook.mjs`](../../hooks/usectx-hook.mjs) | `op0mt_` is a **narrow** grant; `clean` is not a default workspace tool |
| [`mcp.json`](../../mcp.json) | Token-free pack. Auth is process env or client-owned headers |
| [`docs/marketplace-submission.md`](../marketplace-submission.md) | “Memory authority without a grant: No” |

## Call matrix (short)

| Need | Call | First missing piece in *this* checkout |
| --- | --- | --- |
| Durable file bytes | git | Pierre mount + snapshot select |
| Who may use Memory | Host bearer + grants | Pass / grant / revoke types |
| Retrieve settled evidence | MCP `search` | Workspace bearer on the client (LIVE Host, LIVE kit client) |
| Structural hop | MCP `code_graph` if listed | May be absent on hosted card |
| Reviewed projection | Memory write **after** review, citing git SHA | Review UI + citation schema |
| Pack | Host assemble | Entire job |
| Cord | Host / executor invoke | Entire job + no Signals UI |
| Audit | Ledger | Entire job |

## First code seam (same as the gap map)

Palace/Foldkit: Pierre emits `{ repo, commit, path }` from **git**. Memory Host stores a citation of that snapshot (only with a proven tool). Do not implement that seam inside `op0ai/usectx`. Do not invent a Pack or a Run to make the diagram look finished.
