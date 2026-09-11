# Codex / Claude Code / harness notes

Hosted Memory is HTTP MCP. Paste the server block into the client config your harness owns.

### Human / Workspace MCP (`CTX_HTTP_TOKEN`)

See [`cursor.mcp.json`](cursor.mcp.json) or [`claude_desktop_config.json`](claude_desktop_config.json):

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
- Standard human/workspace sessions can run the full suite of interactive tools (`search`, `code_graph`, `health`, etc.).

### Agent / Subagent MCP (`op0mt_`)

For automated agents and sandboxes operating with scoped `op0mt_` credentials, see [`cursor.agent.mcp.json`](cursor.agent.mcp.json):

```json
{
  "mcpServers": {
    "usectx": {
      "url": "https://ctx.op0.ai/mcp",
      "headers": {
        "Authorization": "Bearer op0mt_AGENT_TOKEN"
      }
    }
  }
}
```

- Security hooks strictly gate `op0mt_` tokens: permitted tool catalog is restricted to `agent_identity`, `action_invoke`, and `packet_export`. All other tool invocations fail closed.
- Never disable security hooks or safeguards to bypass this restriction.

### General Notes

- Skills: `npx --yes skills@1.5.23 add op0ai/usectx@v0.4.2` then follow `usectx-attach` → `usectx-session`.
- Workspace `clean` is hook-denied for non-restricted tokens. Never disable security hooks.
- Pack manifests (`mcp.json`, `.mcp.json`) intentionally omit Authorization.
- Optional local lab: point stdio at `./bin/usectx-mcp-stdio.mjs` with `CTX_URL` / token in the environment — see repo-root `mcp.json`.
- Verified kit install: `git clone https://github.com/op0ai/usectx.git && bash install.sh --global`.
