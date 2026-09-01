# usectx

**usectx** is the open harness pack for opzero memory: an embedded retrieve loop over settled project evidence, code graph navigation, stdio and remote MCP server, and agent skills.

Conforms to [Agent Plugins 1.0.0](https://agent-plugins.org).

## Quick Install

```bash
curl -fsSL https://raw.githubusercontent.com/op0ai/usectx/main/install.sh | bash
```

Or via `op0.ai`:

```bash
curl -fsSL https://op0.ai/usectx/install.sh | bash
```

This installs:
- The `usectx` CLI shim to `~/.local/bin/usectx`
- The plugin harness pack to `~/.op0/usectx` (and mirrors to `~/.agents/plugins/usectx`)
- Automatically configures `.cursor/mcp.json` and Claude Desktop config

## Getting Started

### 1. Authenticate via WorkOS AuthKit

```bash
usectx login
```

Opens AuthKit in your browser to authorize your workspace and mints a workspace context bearer token (`ctx_ws_...`).

### 2. Verify Readiness

```bash
usectx readyz
```

Probes the hosted memory service readiness (`GET https://ctx.op0.ai/readyz`).

### 3. Retrieve Context & Query Code Graph

```bash
usectx ask "what calls codeGraphRetrieveWide?"
```

Runs the harness retrieval loop: walks structural dependency edges in pgGraph via `code_graph`, then executes leased hybrid RRF search over indexed project evidence.

## MCP Server

This repository provides two ways to attach memory to AI agents:

1. **Remote MCP (Hosted)**:
   ```json
   {
     "mcpServers": {
       "usectx": {
         "url": "https://ctx.op0.ai/mcp",
         "headers": {
           "Authorization": "Bearer <YOUR_CTX_HTTP_TOKEN>"
         }
       }
     }
   }
   ```

2. **Stdio MCP (Local / Directory Plugin)**:
   ```json
   {
     "mcpServers": {
       "usectx": {
         "type": "stdio",
         "command": "./bin/usectx-mcp-stdio.mjs"
       }
     }
   }
   ```

## Agent Skills

- [`skills/usectx-memory/SKILL.md`](skills/usectx-memory/SKILL.md): Retrieval, lease management, and code graph navigation instructions for AI agents.
- [`skills/usectx-memory/HOOKS.md`](skills/usectx-memory/HOOKS.md): Session lifecycle hooks (`SessionStart`, `SessionEnd`) and canonical data taxonomy.

## License

MIT
