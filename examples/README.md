# Codex / Claude Code / harness notes

Hosted Memory is HTTP MCP. Paste the same server block into the client config your harness owns.

```json
{
  "mcpServers": {
    "usectx": {
      "url": "https://ctx.op0.ai/mcp",
      "headers": {
        "Authorization": "Bearer CTX_HTTP_TOKEN"
      }
    }
  }
}
```

- Replace `CTX_HTTP_TOKEN` with the workspace bearer from https://app.op0.ai/ctx or `usectx login`.
- Skills: `npx skills add op0ai/usectx` then follow `usectx-attach` → `usectx-session`.
- Pack manifests (`mcp.json`, `.mcp.json`) intentionally omit Authorization.
- Optional local lab: point stdio at `./bin/usectx-mcp-stdio.mjs` with `CTX_URL` / token in the environment — see repo-root `mcp.json`.
