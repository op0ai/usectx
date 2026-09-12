# Marketplace submission — usectx 0.4.2

This kit is the **public Memory pack** (`op0ai/usectx`). It is not the private engine (`usectx-lab`) and not the Origin / usectx-app dist.

Submit the **public GitHub repo** `https://github.com/op0ai/usectx`. Do not paste secrets, workspace bearers, or Internal Origin chrome into any listing.

## What this repo actually ships

| Surface | In this GH kit |
| --- | --- |
| Agent Plugin `plugin.json` + token-free `mcp.json` | Yes (portable; required) |
| Optional root `.mcp.json` (Grok / cursor.directory) | Yes when present; token-free companion, not Agent Plugin-required |
| Cursor Plugin `.cursor-plugin/plugin.json` + Host-grant MCP | Yes |
| Grok Build `.grok-plugin/plugin.json` | Yes |
| Skills (`attach`, `session`, `retrieve`, `code-graph`, `extract`) | Yes |
| CLI `usectx` (`login`, `readyz`, `health`, `whoami`, `ask`, `search`, `inspect`, `extract`/`ingest` posture, `validate-hooks`) | Yes |
| Origin 0.4.2 fail-closed hooks | Yes |
| Hosted MCP door `https://ctx.op0.ai/mcp` | Attach only — tokens stay out of pack `mcp.json` |
| `usectx agent` / `usectx packet` CLI | **No** — not in this repo |
| Hosted MCP tools `agent_identity`, `action_invoke`, `packet_export` | Door-side, gated to `op0mt_` grants — not kit CLIs |
| Extract container / engine / doctor | **No** — private lab |
| Memory authority without a grant | **No** — refuse closed |

Marketplace listings must describe attach / MCP / skills / hooks that ship here. This GitHub kit does **not** ship `usectx agent` or `usectx packet` CLIs. Do not advertise app-dist agent features that are absent from this pack.

## Auth rule (all marketplaces)

- **Required:** a Host-issued `op0mt_` grant (agent token).
- **Forbidden in plugin config / marketplace variables:** workspace bearers (`ctx_ws_…`, `CTX_HTTP_TOKEN` pasted into a listing).
- Human/workspace sessions still use `usectx login` or a client-owned `.cursor/mcp.json` (see [`examples/cursor.mcp.json`](../examples/cursor.mcp.json)). That path is **not** the marketplace plugin secret.
- `op0mt_` grants are hook-restricted to `agent_identity`, `action_invoke`, `packet_export`. Leased `search` / `code_graph` stay on workspace bearers in the operator’s own client config.

Cursor marketplace MCP substitutes `${OP0MT_TOKEN}` from Plugins → Configure. Pack Agent Plugin `mcp.json` stays token-free. Root `.mcp.json` is an optional Grok / cursor.directory companion (also token-free when present) — not required for Agent Plugins.

CLI / hooks / stdio bearer order: explicit `CTX_*` env → saved project/home workspace login → `OP0MT_TOKEN` only if no workspace credential exists. A Host grant must not shadow `usectx login` for `ask` / `search`.

---

## 1. Cursor Marketplace

**Publish form:** https://cursor.com/marketplace/publish

Cursor accepts either:

- Agent Plugin — root [`plugin.json`](../plugin.json) (already ships; agent-plugins.org 1.0.0)
- Cursor Plugin — [`.cursor-plugin/plugin.json`](../.cursor-plugin/plugin.json) (hooks + skills + Host-grant MCP)

This repo ships **both**. Marketplace review can load the Cursor Plugin (hooks + `${OP0MT_TOKEN}`) or the portable Agent Plugin (skills + token-free MCP).

### Form / review checklist (fill before submit)

Copy from [Cursor Plugins reference](https://cursor.com/docs/reference/plugins):

- [ ] Public Git repository: `https://github.com/op0ai/usectx`
- [ ] Valid root `plugin.json` **or** `.cursor-plugin/plugin.json` (this kit has both)
- [ ] `name` is unique, lowercase, kebab-case: `usectx`
- [ ] `description` states attach / lease / hop — not invented Memory authority
- [ ] Skills under `skills/*/SKILL.md` have `name` + `description` frontmatter
- [ ] Hooks at `hooks/hooks.json` use non-empty commands (`node ./hooks/usectx-hook.mjs …`)
- [ ] Cursor Plugin `variables` declare every `${VAR}` used in [`.cursor-plugin/mcp.json`](../.cursor-plugin/mcp.json) (`OP0MT_TOKEN` only)
- [ ] No secrets in the repo; pack `mcp.json` has no `Authorization`
- [ ] All manifest paths are relative (no `..`, no absolute paths)
- [ ] `README.md` documents install + Host `op0mt_` grant
- [ ] Version aligned with kit **0.4.2**
- [ ] Plugin tested locally (clone → Cursor Customize / local plugin load, or `npm test` + `usectx validate-hooks`)
- [ ] Single-plugin repo: **no** `.cursor-plugin/marketplace.json` (that file is only for multi-plugin catalogs)

### Submit steps

1. Land this packaging on `main` (or submit the public default branch Cursor should clone).
2. Open https://cursor.com/marketplace/publish
3. Paste `https://github.com/op0ai/usectx`
4. Confirm the listing text matches **What this repo actually ships** (above).
5. After listing, install from the Cursor Marketplace UI and set **Host `op0mt_` grant** under Plugins → Configure (`OP0MT_TOKEN`). Never a workspace bearer.

### Local smoke (before submit)

```bash
git clone --depth 1 https://github.com/op0ai/usectx.git
cd usectx
npm test
node ./bin/usectx-validate-hooks.mjs hooks/hooks.json
python3 -m json.tool plugin.json >/dev/null
python3 -m json.tool .cursor-plugin/plugin.json >/dev/null
```

Optional Cursor load: copy the clone to `~/.cursor/plugins/local/usectx`, reload the window, confirm skills + hooks appear.

---

## 2. xAI Grok Build marketplace

Official catalog: https://github.com/xai-org/plugin-marketplace  
Contributor guide: https://github.com/xai-org/plugin-marketplace/blob/main/CONTRIBUTING.md

Grok Build’s `/marketplace` UI installs from that index. Third-party plugins are **remote + SHA-pinned**. Do **not** vendor this kit under `external_plugins/` unless xAI asks.

This source repo already has:

- [`.grok-plugin/plugin.json`](../.grok-plugin/plugin.json) — per-plugin manifest
- [`.grok-plugin/marketplace.json`](../.grok-plugin/marketplace.json) — self-hosted catalog (`grok plugin marketplace add op0ai/usectx`)
- Root `.mcp.json`, `skills/`, `hooks/hooks.json`

### Ready catalog entry (remote, SHA-pinned)

Machine copy: [`marketplace/xai-official.entry.json`](marketplace/xai-official.entry.json)

```json
{
  "name": "usectx",
  "description": "Public usectx Memory kit: attach hosted MCP, session lease, hop the code graph. Host op0mt_ grants required — never a workspace bearer.",
  "category": "development",
  "source": {
    "source": "url",
    "url": "https://github.com/op0ai/usectx.git",
    "sha": "REPLACE_WITH_40_CHAR_COMMIT_SHA"
  },
  "homepage": "https://github.com/op0ai/usectx",
  "keywords": ["usectx", "op0", "ctx.op0.ai"],
  "domains": ["op0.ai", "ctx.op0.ai", "app.op0.ai"]
}
```

Keywords stay brand-scoped (`usectx`, `op0`, `ctx.op0.ai`). Generic terms (`memory`, `mcp`, `cli`, `search`) mis-fire Grok’s plugin CTA and get review pushback.

### Pin the SHA

Pin a **full 40-character lowercase commit**, not `main`, not `v0.4.2`, not an abbreviated SHA.

After this packaging lands on the public default branch:

```bash
git ls-remote https://github.com/op0ai/usectx.git HEAD
# or, from a local checkout of the commit you intend to ship:
git rev-parse HEAD
```

Replace `REPLACE_WITH_40_CHAR_COMMIT_SHA` in the entry. Grok Build re-checks `git rev-parse HEAD == sha` after clone.

**Do not open the xAI PR until `main` (or the intended tag) contains this packaging** and the SHA is reachable from a public clone. A branch-only SHA disappears if the branch is deleted.

### Fork + PR steps (maintainer, after SHA is public)

1. Fork https://github.com/xai-org/plugin-marketplace and branch from `main`.
2. Append the entry above to `.grok-plugin/marketplace.json` → `plugins` (valid JSON, unique `name`: `usectx`).
3. From the **catalog fork** root:

   ```bash
   python3 scripts/generate-plugin-index.py
   python3 scripts/validate-catalog.py
   python3 scripts/generate-plugin-index.py --check
   ```

4. Commit the catalog entry **and** the regenerated `.grok-plugin/plugin-index.json` (never hand-edit the index).
5. Open a PR against `xai-org/plugin-marketplace`. Code-owner review is required. CI fails on stale index, unpinned SHA, or unreachable commit.

To roll out a later kit: bump the same entry’s `sha` and regenerate the index. Do not add a duplicate `usectx` row.

### Grok install after listing

- Official catalog: in Grok Build, `/marketplace` → install `usectx`.
- Direct (tracks HEAD, not SHA-pinned): `grok plugin install op0ai/usectx`
- Self-hosted catalog: `grok plugin marketplace add op0ai/usectx`

Configure a **Host `op0mt_` grant** for plugin MCP. Never a workspace bearer.

---

## 3. cursor.directory (community listing)

Community directory (not the official Cursor Marketplace): https://cursor.directory

Submission is a **website form**, not a data PR ([cursor/community-plugins](https://github.com/cursor/community-plugins)):

1. Open https://cursor.directory/plugins/new
2. Sign in with GitHub or Google (prefer the `op0ai` org account).
3. Paste `https://github.com/op0ai/usectx`
4. Submit. The scanner auto-detects Open Plugin paths:

   | Component | Path in this repo |
   | --- | --- |
   | MCP | `.mcp.json` (token-free) |
   | Skills | `skills/*/SKILL.md` |
   | Hooks | `hooks/hooks.json` |

5. Wait for the safety scan (`safe` / `suspicious` / `malicious`). Listing appears after `safe`.

Same public repo URL as Cursor Marketplace. Still require Host `op0mt_` grants in the listing copy; do not tell community users to paste a workspace bearer into the plugin.

---

## Maintainer checklist (this kit)

- [ ] Kit version **0.4.2** in `VERSION`, `plugin.json`, `.cursor-plugin/plugin.json`, `.grok-plugin/plugin.json`
- [ ] No tokens in pack manifests
- [ ] Cursor publish form submitted
- [ ] cursor.directory form submitted
- [ ] xAI catalog PR opened **only after** a public SHA exists (entry + `generate-plugin-index` + `validate-catalog`)
- [ ] Listing copy does not claim `agent`/`packet` CLI or Memory without a grant
