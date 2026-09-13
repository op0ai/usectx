# Forge and environment source of truth

Base hygiene only. This map is for Cloud Agents, pull requests, and local/dev consistency. It is not a product spec and it does not authorize Alchemy/prod promote.

Kit version when written: **0.4.2**. Official Origin rules cited from [Origin](https://cursor.com/docs/origin), [Mirror a GitHub repository](https://cursor.com/docs/origin/mirror-github), [Pull requests](https://cursor.com/docs/origin/pull-requests), [Create a repository](https://cursor.com/docs/origin/create-repository), and [Integrations](https://cursor.com/docs/origin/integrations).

## What this Cloud Agent could and could not verify

| Check | Result in this session |
| --- | --- |
| This checkout | Public GitHub `https://github.com/op0ai/usectx`, default branch `main` @ `a06b75b` |
| Hosted Memory accept | `GET https://ctx.op0.ai/readyz` → `ok`, `retrievalMode: hybrid` |
| Workspace Memory lease | **Refused** — no `CTX_HTTP_TOKEN` / `~/.op0/usectx/token`, no MCP `search` in the session catalog. Do not treat later rows as leased memory. |
| Origin CLI | Present (`origin`). `origin auth status` → **not logged in**. No `origin repo list` / `origin repo view`. |
| `op0ai/usectx-lab` on GitHub | This token: `Could not resolve to a Repository` (private or out of scope). Named in kit docs as the private engine lab. |
| Public `op0ai/*` visible here | `usectx`, `design-book`, `opensolar`, `audio-utils`, `v0-landing-template`, `claude-skills`, `wav0`. **No public palace/app repo** in that list. |
| This CA environment | Personal env, `repos: [github.com/op0ai/usectx]`, no committed `.cursor/environment.json`. Run attached to GitHub, not an Origin `tmp-*` slug. |
| App Origin tip `op0/tmp-1740c01a5c568cfe` | **Not re-verified here.** Operator-reported: Origin-hosted, `mirrorStatus=no-mirror`, Cloud Agent `ManagePullRequest` refused `repoKind=agent_temp`. |
| Desk / land SHAs | **Not re-verified here.** Operator-reported: Mac land `labs/usectx-journeys`; Desk Slice1 on Origin branch `labs/repo-desk-20260912` @ `7d05063`. |

If a cell below says “verify on Mac”, do that before treating the row as current.

```bash
origin auth login
origin repo list
origin repo view op0/tmp-1740c01a5c568cfe --json org,name,defaultBranch,mirrorStatus
# Repeat view for every Origin slug you still use (kit / lab / app / cord).
```

Do not invent Origin browse URLs or GitHub app/lab/cord URLs. Copy them from `origin repo view`, `origin repo list`, or `gh repo view`.

## Official forge rules (do not mix)

| Kind | Who is SoT | What Origin holds | How Cloud Agents open PRs |
| --- | --- | --- | --- |
| **Origin-hosted** (created with Origin **New** / `origin repo create`, or detached from GitHub) | Origin | The git repo. PRs stay on Origin and are **not** mirrored anywhere. | Origin PRs. |
| **Synced from GitHub** (codebase **Sync from GitHub** / `origin repo create-mirrored`) | **GitHub** | Mirror of git history, branches, tags, and GitHub PRs. Not GitHub Issues, Actions, or secrets. | **GitHub PRs.** |
| `mirrorStatus=no-mirror` | Treat as **not synced**. Do not claim a GitHub mirror exists. | Whatever Origin already stored. | Do not assume GitHub PRs. |

Pushes to a synced Origin remote pass through to GitHub; Origin updates after GitHub accepts the push. Detach from GitHub **stops** that and turns the Origin copy into Origin-hosted SoT. Do not detach a repo you need reliable CA → GitHub PRs on.

Forge-local branches named `origin` / `origin/…` stay on Origin and are not GitHub PR heads (`origin push local`). Do not use those names as the land branch.

**Deploy is not git sync.** Alchemy / Host / Memory promote is a separate operator action. Merging a PR or fast-forwarding `labs/*` does not ship production Host/Memory. This hygiene work must not Alchemy-promote.

## Repo map

Status values: **verified in this CA** · **named in this kit, not visible here** · **operator-reported, verify on Mac**.

| Repo / surface | Forge | SoT today | What should sync | How agents open PRs | Alchemy / prod |
| --- | --- | --- | --- | --- | --- |
| Public Memory kit (`op0ai/usectx`) | GitHub. Origin mirror: **unknown here** | GitHub `main` (**verified**) | Optional Origin **Sync from GitHub** only. Do not create a second Origin-hosted copy. | This CA class: **GitHub PRs** on `op0ai/usectx` (**verified** attach). | None. Kit is attach/skills/CLI, not Host/Memory deploy. |
| Engine lab (`op0ai/usectx-lab`) | GitHub private (**named in kit**; token cannot see it). Origin: unknown | Lab git (**not this pack**) | If CA PRs are required: GitHub SoT + Origin Sync. Do not fold into the public kit. | Only after the GitHub repo is the CA attach target. | Lab iterate ≠ prod promote. |
| App / palace dogfood tip | Origin slug `op0/tmp-1740c01a5c568cfe` (**reported**) | Reported **Origin-hosted**, `mirrorStatus=no-mirror` | **No sync exists** until Mac proves otherwise. After Path A: GitHub SoT, Origin = mirror. | Reported **broken** for `ManagePullRequest` (`repoKind=agent_temp`). After Path A: GitHub PRs. | Deploy ≠ git. Do not promote as part of moving SoT. |
| Cord | **Unknown here** — no URL in this kit | Stays its own repo | Do not invent a slug. If CA PRs are required: same Path A. | Unknown until Mac `origin repo view` / `gh repo view` | Separate from kit/lab/app. |
| Hosted Memory door | Not a git forge | Runtime `https://ctx.op0.ai` | N/A | N/A | Accept probe `/readyz`. Promote is Alchemy/ops, not a merge. |

Kit docs already say this pack is not the engine and not the “Origin / usectx-app dist”. That label is **not** a verified GitHub URL.

## Recommendation: Path A for the app tip

**Chosen path: A — GitHub as SoT, then Sync that GitHub repo into Origin.**

Use this for the app dogfood tip and for any other repo that needs reliable Cloud Agent PRs.

| Path | Verdict |
| --- | --- |
| **A. GitHub SoT + Origin Sync** | **Do this.** Official docs: mirrored repos keep GitHub as SoT; attached cloud agents open **GitHub** PRs. This kit CA is already on that pattern. |
| **B. Rename Origin-hosted off `tmp-*` / `agent_temp`** | **Do not.** Not proven from here (`origin` not authenticated). Even a durable Origin-hosted name still keeps PRs **on Origin only**, which is the class `ManagePullRequest` already refused on the tmp slug. Rename alone is a half-migration. |
| **C. Other** | **None proven.** Dual-push remotes without Sync, detach-then-rename, or treating `origin/…` branches as land are not a SoT. |

### Why A (and not B) from this session

1. Cursor docs are explicit: Sync ⇒ GitHub SoT + GitHub PRs; Origin-hosted ⇒ Origin SoT + Origin-only PRs.
2. This run’s environment is `github.com/op0ai/usectx`. The Cloud Agent PR tool is built for that GitHub class, not `repoKind=agent_temp`.
3. B cannot be validated here. A rename that leaves the repo Origin-hosted does not change the PR forge.
4. Reported `mirrorStatus=no-mirror` means there is **no** current GitHub mirror to “just enable PRs” on. Sync is a new, complete bind — not a status flip.

### Arth: execute Path A end to end (app tip)

Do not start Cloud Agent product work on the tmp slug while it is still SoT. Do not Alchemy-promote. Do not create a second Origin-hosted app.

1. **Read current Origin facts (Mac)**

   ```bash
   origin repo view op0/tmp-1740c01a5c568cfe --json org,name,defaultBranch,mirrorStatus
   git -C <app-checkout> remote -v
   git -C <app-checkout> branch -vv
   git -C <app-checkout> log --oneline -20
   ```

   Confirm `mirrorStatus` before assuming no-mirror. Note the default branch and whether `labs/usectx-journeys` and `labs/repo-desk-20260912` (`7d05063`) are on that remote.

2. **Pick one durable GitHub SoT repo**

   - If a private GitHub app repo already exists, use it. This session could not see one under public `op0ai/*`.
   - If none exists, create **one** `op0ai/<durable-app-name>` (not `tmp-*`, not `agent_temp`). Record the real URL; do not reuse the Origin tmp slug as the GitHub name unless you are deliberately keeping a bad name.
   - Grant the Cursor GitHub app admin on that repo (Origin Sync requires GitHub admin).

3. **Push the full tip to GitHub (git, not deploy)**

   From the Mac checkout that has the Origin tip:

   ```bash
   git remote add github git@github.com:op0ai/<durable-app-name>.git   # or HTTPS
   git push github HEAD:main                    # or the GitHub default you chose
   git push github labs/usectx-journeys         # if that is the land branch
   git push github labs/repo-desk-20260912      # keep Desk Slice1 reachable
   git push github --tags
   ```

   Fast-forward only when the destination is a strict ancestor. Do not rewrite shared `labs/*` history to “make it neat.”

4. **Sync GitHub → Origin (new mirror, not a rename of tmp)**

   - Codebase: **Sync from GitHub** (or `origin repo create-mirrored <github-owner/repo>`).
   - Confirm on the **new** Origin copy:

     ```bash
     origin repo view <origin-namespace>/<mirror-name> --json org,name,defaultBranch,mirrorStatus
     ```

   - Expect GitHub as source, Origin as mirror — **not** `no-mirror`.
   - Point the Cloud Agent environment at **`github.com/op0ai/<durable-app-name>`**, same class as this kit. Do not attach new CAs to `op0/tmp-1740c01a5c568cfe` once the mirror exists.

5. **Prove one GitHub PR**

   Push a no-op or docs branch on the GitHub remote and open a GitHub PR (human or CA). Merge or close it on **GitHub**. Origin should show that GitHub PR on the mirrored repo.

6. **Retire the tmp Origin-hosted slug**

   After step 5: stop pushing to `op0/tmp-1740c01a5c568cfe`; retarget Mac remotes and CA env to GitHub SoT. Keep the tmp repo readable until you are sure no one is still cloning it. Do **not** Detach the new mirror. Deleting tmp is optional and later.

7. **Land path after cutover**

   | Actor | Land |
   | --- | --- |
   | Cloud Agent | Branch + **GitHub** PR into the agreed base (`main` or `labs/usectx-journeys` — pick one and write it down). |
   | Mac | `git push` + GitHub PR, or `origin pr create` **on the mirrored repo** (docs: that opens a GitHub PR). Fast-forward `labs/usectx-journeys` only after the PR is the SoT merge. |

   Drop “push and FF with no PR” as the default once GitHub is SoT.

### Kit and lab (same rule, smaller move)

- **Kit:** already Path A on GitHub. Optional: Sync `op0ai/usectx` into Origin for browse. Verify with `origin repo view` whether a mirror already exists. Never Origin-host a fork of this kit.
- **Lab:** stay private and separate. If CAs must open lab PRs, apply Path A to the real GitHub lab URL (confirm with a token that can see `op0ai/usectx-lab`).

## Local / dev consistency checklist

Match these across **Mac**, **Cloud Agent**, and **preview**. Divergence is the usual break.

### URLs (portless)

- Prefer **named local hosts** (no `:port` in the URL people type or paste into MCP).
- Kit residual (do not treat as the app convention): optional local lab is still documented as `CTX_URL=http://127.0.0.1:4790` plus `ALLOW_LOOPBACK=1`. Hosted attach stays `https://ctx.op0.ai/mcp` and `/readyz`.
- Preview / dogfood app URLs must be the same names on Mac and in CA secrets. Do not commit a Mac-only `localhost:3000` while preview uses another host.
- Hosted vs loopback is an explicit choice. Installer refuses loopback unless `ALLOW_LOOPBACK=1`.

### Branches

| Surface | Branch rule |
| --- | --- |
| Public kit | Default `main`. CA branches `cursor/**`. CI runs on `main` and `cursor/**` (`.github/workflows/ci.yml`). |
| App / lab land | `labs/*` (reported: `labs/usectx-journeys` land; dated desk branches such as `labs/repo-desk-20260912`). |
| Origin forge-local | `origin/…` is **not** a GitHub land branch. |

Write down one app integration branch name and use it on Mac, CA base, and preview checkout.

### Secrets

- Never commit tokens, `.env`, or workspace bearers. This kit: pack `mcp.json` is token-free; `.gitignore` includes `*.local` and `.op0/`.
- Bearer for Memory: `usectx login` or client MCP `Authorization` — not `/work`, not pack JSON, not marketplace listings.
- CA secrets live in the Cloud Agent environment, not in `environment.json` or the repo.
- Marketplace Host grant is `op0mt_` only. Do not put `ctx_ws_…` / `CTX_HTTP_TOKEN` in plugin config.

### Cwd / which repo you are in

| Work | Cwd |
| --- | --- |
| Public kit (CLI, skills, hooks, marketplace) | Clone of `op0ai/usectx` |
| Engine / extract / doctor | `usectx-lab` (private) — do not clone lab to “attach Memory” |
| Palace / app UI and dogfood | App GitHub SoT (after Path A), not this kit |
| Cord | Cord repo only |

A kit CA environment must not be reused as the app environment. This run’s env is single-repo `github.com/op0ai/usectx` — correct for kit hygiene, wrong for app features.

### What must match Mac / CA / preview

- [ ] Same GitHub remote URL for the repo being changed.
- [ ] Same default branch and same `labs/*` land name.
- [ ] Same hosted Memory door (`ctx.op0.ai`) unless the session **explicitly** opted into local lab.
- [ ] Same portless preview/app hostnames (or documented, shared exceptions).
- [ ] CA `repositoryDependencies` / env `repos` list every git repo the agent may push (multi-repo is supported; this kit env is kit-only).
- [ ] No extra Origin-hosted SoT sitting beside the GitHub SoT for the same tree.

## Multi-repo sprawl (honest)

Keep these **separate** until a later, explicit consolidate:

| Keep separate | Why |
| --- | --- |
| **Kit** `op0ai/usectx` | Public attach surface. Strangers install this. Tokens stay out. |
| **Lab** `usectx-lab` | Private engine. Different visibility, release, and risk. |
| **App / palace** | Product dogfood. Different SoT move (Path A) and different CA env. |
| **Cord** | Separate concern. No URL in this kit; do not fold it in “for convenience.” |
| **Hosted Memory / Alchemy** | Runtime and deploy. Not a fourth git remote of the kit. |

**Do not consolidate now.** A monorepo or “everything on Origin-hosted” would mix public marketplace history with private engine and app tip, and it would not fix `agent_temp` PRs.

**Consolidate later (only with a written cutover):** shared preview naming, one app GitHub SoT + one Origin mirror, optional kit Origin mirror, lab remaining private. Still three git repos plus deploy. “One palace repo” is a later product decision, not this hygiene PR.

## Manual Mac / Origin steps still remaining

This PR only adds the map. It does not move the app tip.

1. `origin auth login` on Mac (this CA cannot).
2. `origin repo view op0/tmp-1740c01a5c568cfe --json …mirrorStatus` and the same for kit/lab/cord slugs.
3. Confirm or create the durable **GitHub** app repo; push `main` + `labs/*` + desk SHA.
4. **Sync from GitHub**; confirm the new Origin row is a mirror, not `no-mirror`.
5. Retarget CA env to `github.com/…` app; prove one GitHub PR; stop using the tmp slug.
6. Optional: Sync this public kit to Origin (mirror only).
7. Do **not** Alchemy-promote, Detach the new mirror, or delete tmp until step 5 is done.
