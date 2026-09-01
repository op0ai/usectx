# usectx

Memory kit for agents. Agent Plugins 1.0.0 directory (`plugin.json` + `skills/` + `mcp.json`) plus SKILL.md files any harness can load.

Version **0.2.0**. Tokens are never in `mcp.json`.

## Install

Interactive (see the plan, confirm):

```bash
curl -fsSL https://op0.ai/usectx/install.sh -o install-usectx.sh
bash install-usectx.sh
```

Hanna / pipe (project-local `./usectx`, no home MCP):

```bash
curl -fsSL https://op0.ai/usectx/install.sh | bash
```

Home pack + global Cursor/Claude MCP (explicit):

```bash
curl -fsSL https://op0.ai/usectx/install.sh | bash -s -- --global
```

SKILL.md into the current project for Cursor / Claude Code / Codex / others (`npx skills` does **not** login or write a bearer):

```bash
npx skills add op0ai/usectx
```

Then:

```bash
usectx login
```

Token path: `~/.op0/usectx/token`. View at https://app.op0.ai/ctx. Global MCP: `usectx login --global`.

## Skills

| Skill | Leading word | When |
| --- | --- | --- |
| `usectx-attach` | attach | wire MCP / login / bearer |
| `usectx-retrieve` | lease | search settled evidence |
| `usectx-code-graph` | hop | walk callers/callees |
| `usectx-extract` | extract | fill the index |

Claude Code loads `.claude-plugin/plugin.json` and `skills/*/SKILL.md`. It does not load Agent Plugins root `plugin.json`. Both layouts ship in this repo.

## MCP

`mcp.json` declares stdio (`./bin/usectx-mcp-stdio.mjs`) and hosted `https://ctx.op0.ai/mcp`. No `Authorization` header. Stdio reads `CTX_HTTP_TOKEN` or `~/.op0/usectx/token`.
