# usectx 0.4.2 — Memory kit for agents

**Attach in one login. Lease search. No core clone.**

usectx is the public Memory kit for agent harnesses (Cursor, Claude, Codex, and friends). Point MCP at `https://ctx.op0.ai/mcp` with your workspace bearer, verify `/readyz`, and call `search`. The door mints a lease; wrong or missing tokens refuse closed — agents do not invent memory.

### One path

```bash
git clone --depth 1 https://github.com/op0ai/usectx.git
cd usectx && bash install.sh --global
usectx login --global
```

Or MCP-only: copy `examples/cursor.mcp.json` → `.cursor/mcp.json`, replace the bearer from [app.op0.ai/ctx](https://app.op0.ai/ctx).

Skills (optional): `npx --yes skills@1.5.23 add op0ai/usectx@v0.4.2`

Marketplace (Cursor / Grok `/marketplace` / cursor.directory): Host `op0mt_` grants only — never a workspace bearer. See [`docs/marketplace-submission.md`](./docs/marketplace-submission.md).

### Works today

- Hosted leased `search`, `code_graph` (when indexed), `health` / `/readyz`
- Session skill loop: attach → lease → refuse closed → hop → settle when ingest is in the catalog
- Origin 0.4.2 hooks: `{ permission, continue }`, `failClosed` on prompt + MCP, `op0mt_` catalog, workspace `clean` deny

### Needs your login

Workspace bearer via `usectx login` or the ctx app. Pack manifests stay token-free.

### Not this kit

Engine / lab (extract container, door internals, doctor) iterates in private `usectx-lab`. This pack stays thin.

Full notes: [CHANGELOG.md](./CHANGELOG.md)
