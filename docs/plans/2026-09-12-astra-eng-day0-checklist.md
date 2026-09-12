# Astra Day-0 checklist — Foldkit + Pierre + one cord run

Peer note for Codex on a Mac. You are the engineering wave. This primer is alignment, not the desk.

Trust your read of the trees. Self-check against the locks. If a tool is not on `tools/list`, it is not there.

**Do not title yourself Astra in product copy. Do not implement the Foldkit desk in `op0ai/usectx`.**

Written 2026-09-12 against public kit `a06b75b0f4a80e3a90f67e663288476842c5edbf` (0.4.2). Refresh every SHA before you cut code.

Related: [`2026-09-12-eng-wave-primer-gaps.md`](2026-09-12-eng-wave-primer-gaps.md), [`2026-09-12-git-vs-memory-eng-implications.md`](2026-09-12-git-vs-memory-eng-implications.md), [`../evidence/2026-09-12-public-kit-hosted-snapshot.md`](../evidence/2026-09-12-public-kit-hosted-snapshot.md).

## Product locks (self-check)

1. Git = durability for file/repo Sources. Memory = authority for Pass→Pack (actor+grant+revoke). Ledger audits assemble/run/save — **not** a second git. Desk = git Source select + Memory save + cord run. Pierre = git UI primitive.
2. Signals = cord plugin/connector ingress only. No Signals nav / peer dashboard.
3. Pierre edit = inspect → draft → review → explicit Save. Citations stay on immutable snapshots.
4. Token labels measured at assemble (tokenizer T) or marked `est`. No decorative counts.
5. Browser Run / repo Save stay **unavailable** until those paths exist.
6. Foldkit TEA is the web architecture bet. Fate is never adopt. Pierre trees+diffs stay locked.
7. Lanes: op0 company · entirething palace · usectx context SDK · cord execution.

If a change violates a lock, stop and say so.

## 0. You are probably in the wrong repo if…

You opened **only** `op0ai/usectx` and started a Foldkit component.

This repository is the **public Memory kit**: attach, lease, hooks, marketplace manifests. Engine, palace, Pierre, Pack, and cord are **not** here. Closed [PR #1](https://github.com/op0ai/usectx/pull/1) already rejected an engine monorepo in this tree.

Day-0 means: identify the **palace / Foldkit / lab** checkouts you can actually see on the Mac, plus this kit as the Memory **client**.

## 1. Refresh SHAs (do this first)

Record the columns. Do not work from last week’s memory.

| Tree | Command | Write down |
| --- | --- | --- |
| Public kit | `git fetch origin main && git rev-parse origin/main` in `usectx` | Full 40-char SHA + `VERSION` |
| Hosted door | `curl -sS https://ctx.op0.ai/readyz` | `retrievalMode` (`hybrid` or `lexical`) |
| Hosted card | `curl -sS https://ctx.op0.ai/.well-known/mcp/server-card.json` | `tools[]` |
| Hosted prose | `curl -sS https://ctx.op0.ai/llms.txt` | Write/grant rules |
| Private lab / core | `git fetch` + `rev-parse` **if you have access** | SHA; if 404, say **no access** — do not invent `packages/ctx` |
| Palace / Foldkit | same | SHA or **absent** |
| Cord / executor | same | SHA or **absent** |
| Public docs | https://op0.ai/docs/usectx/ | Page date vs kit date (docs were 2026-09-01; kit 0.4.2 is newer) |

Private plans cited by public docs (`docs/plans/2026-08-12-prd-o6-canvas.md`, Pen PDFs) are **not** in the public kit. If you can open them, cite their SHAs. If you cannot, **do not reconstruct contents.**

Primer-run kit SHA (stale the moment `main` moves): `a06b75b0f4a80e3a90f67e663288476842c5edbf`.

## 2. Safe checkout

```bash
# Public kit — attach client only
git clone https://github.com/op0ai/usectx.git
cd usectx && git checkout -B day0 origin/main
test "$(cat VERSION)" = "0.4.2"   # or whatever origin/main says after refresh
npm test
node ./bin/usectx-validate-hooks.mjs hooks/hooks.json
```

Then, **only if those remotes exist for you**:

- Palace / Foldkit — own worktree. Do not copy it into `usectx/`.
- `usectx-lab` / `core` — own worktree. **Do not clone core into the public kit** (`AGENTS.md`).
- Cord — own worktree.

Login (human / workspace), not marketplace:

```bash
# from the kit (or install.sh --global)
usectx login --global
curl -sS https://ctx.op0.ai/readyz
usectx whoami          # must not print the secret
usectx ask "ready"     # or MCP search { "query": "ready", "limit": 1 }
```

Token path: `~/.op0/usectx/token` or `CTX_HTTP_TOKEN`. Mint at https://app.op0.ai/ctx (hosted `llms.txt` also names https://app.usectx.com/attach). **Never `/work`.** Never put `ctx_ws_…` in pack or marketplace config.

`op0mt_` is a Host grant. Hooks allow it only for `agent_identity`, `action_invoke`, `packet_export`. Do not use it as your Day-0 `search` bearer if a workspace login exists.

## 3. File manifest — public kit (what you may rely on)

Authoritative list at primer SHA: [`../evidence/2026-09-12-public-kit-hosted-snapshot.md`](../evidence/2026-09-12-public-kit-hosted-snapshot.md).

| Path | Role |
| --- | --- |
| `bin/usectx` | CLI: login, readyz, health, whoami, inspect, ask, search, extract/ingest **posture**, validate-hooks |
| `bin/usectx-token.mjs` | Bearer resolve |
| `bin/usectx-mcp-stdio.mjs` | Stdio → `POST /mcp` |
| `hooks/usectx-hook.mjs` + `hooks/hooks.json` | Fail-closed 0.4.2 |
| `skills/usectx-*/SKILL.md` | attach / session / retrieve / code-graph / extract |
| `examples/cursor.mcp.json` | Workspace MCP |
| `examples/cursor.agent.mcp.json` | `op0mt_` example |
| `.cursor-plugin/mcp.json` | Marketplace Host grant only |
| `docs/marketplace-submission.md` | Honest ship list |

**Not in the kit:** Foldkit, Pierre, Pack assemble, tokenizer, cord runner, ledger, Signals UI, Fate, `usectx accept` / `usectx up` / `usectx bench`, `usectx agent` / `usectx packet`.

## 4. First vertical slice (order)

Do **one** thin path. Stop at the first missing Host tool.

1. **Prove Memory attach** with a workspace bearer: `/readyz` + `tools/list` + `search` `{ "query": "ready", "limit": 1 }`. Record the **actual** tool names. Primer-run public card had `search` + `document_*` and did **not** list `code_graph` or `ingestTranscriptProjection`.
2. **Prove git identity** in the palace repo you will reason about: `git rev-parse HEAD`, path, `git rev-parse HEAD:path` (blob) if you need bytes. No UI required.
3. **Pierre mount (trees + diffs) on that repo** — first *product* code. Inspect-only is enough for slice 1. No Fate. No Signals.
4. **Cite the snapshot into Memory** using a tool that `tools/list` actually returned. If that is `document_put`, store a **citation** (SHA, path), not a second copy of the whole tree. `sourceUrl` is never fetched — do not rely on it to load git.
5. **Assemble** only if a Host assemble/Pack tool exists. Else **stop** and say Pack is missing. Do not invent token counts.
6. **One real cord run** only if invoke is on the catalog **and** a connector exists. Else Browser Run stays unavailable. Evidence = invocation receipt, not a screenshot of a fake button.
7. **Reviewed Memory save** after an explicit review step, citing the **same** SHAs. No silent save.

Slice 1 is done when steps 1–4 have receipts. Steps 5–7 are the rest of the wave, not Day-0 theater.

## 5. Stop conditions

Stop and report. Do not “make it look finished.”

| Signal | Stop |
| --- | --- |
| No palace / Foldkit checkout on the Mac | You cannot ship Pierre here. Primer + attach only |
| No workspace bearer / 401 | **REFUSED.** Do not invent Memory |
| `tools/list` lacks assemble / pack | No Pack; no token labels except `est` if you must show a slot |
| `tools/list` lacks cord invoke | No Run control |
| Temptation to add desk UI to `op0ai/usectx` | Wrong repo |
| Temptation to clone `core` into the kit | Forbidden |
| Temptation to adopt Fate | Forbidden |
| Temptation to add Signals nav | Forbidden |
| Token number without tokenizer T | Forbidden unless marked `est` and obviously unmeasured |
| Citations pointed at a dirty worktree | Draft only; do not Save to Memory as current |
| Ledger designed as “Memory git” | Forbidden |
| `packet_export` / `action_invoke` used without a successful Host call | Those strings are hook allowlist, not proof |
| Pen / private PRD not readable | Do not hallucinate them |

## 6. Evidence required (before you claim a slice)

Check boxes only with artifacts (command output, JSON-RPC id, git SHA). Not vibes.

Day-0 attach:

- [ ] `/readyz` body saved
- [ ] `tools/list` saved (workspace grant **and** `op0mt_` if you will use one)
- [ ] `search` ready — hits **or** honest empty **or** refused (labeled)
- [ ] `usectx whoami` (no secret)

Git Source:

- [ ] `rev-parse HEAD` + repo remote
- [ ] path + blob/tree SHA for the cited file
- [ ] Pierre inspect screenshot or CLI tree/diff **only after** Pierre exists

Memory cite:

- [ ] Host request/response (tool name, ids, `sourceVersion` if any)
- [ ] Citation payload includes git SHA (not just title text)

Cord (later):

- [ ] Invoke request/response
- [ ] Ledger line for run (or an honest “no ledger yet”)
- [ ] Run control **absent** if invoke was not proven

Save (later):

- [ ] Review step existed
- [ ] Save cites the same SHAs
- [ ] File Save (if any) is git; Memory save is authority — two receipts

## 7. Self-check questions

Answer in the PR / notes, not in your head.

1. Which repo did I change, and which lane is that?
2. Did I call git for bytes/history and Memory for authority?
3. Did I print a token count? If yes, where is T?
4. Can a reviewer replay attach from the receipts without my laptop state?
5. Did I ship Run or repo Save without a path?

If you cannot answer 1–2 cleanly, the slice is not done.

## 8. Kit-side work (only if you must touch `usectx`)

Allowed: catalog honesty (skills/CLI match `tools/list`), hook/grant bugs, attach regressions, primer corrections.

Not allowed: Foldkit desk, Signals, Fate, decorative UI, prod deploy, secrets.

If you change kit copy, bump nothing unless behavior changes. This primer did not bump 0.4.2.
