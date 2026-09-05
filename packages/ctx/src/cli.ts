#!/usr/bin/env bun
/**
 * Local ctx CLI entry (stub). Commands: doctor | http | inspect | help
 */

import { PINNED, designedPosture, stubReadyz } from "./posture.ts";
import { createStubHttpServer } from "./http/server.ts";

function printHelp(): void {
  console.log(`@op0/ctx (scaffold stub)

Commands:
  doctor    print engine pins + honest degradation posture
  http      start local ctx HTTP door on 127.0.0.1:4790 (stub)
  inspect   print readyz-shaped JSON for the stub
  help      this message

Import the real engine from op0ai/core — see scripts/import-from-core.md.
Kit (client) CLI remains at repo-root ./bin/usectx
`);
}

async function doctor(): Promise<number> {
  const posture = designedPosture({ pggraphVersion: PINNED.pggraph, pgcontextPresent: false });
  console.log(`@op0/ctx doctor (scaffold)
package:     ${CTX_LABEL}
stub:        true
effect:      ${PINNED.effect}
alchemy:     ${PINNED.alchemy}
graphify:    ${PINNED.graphify}
pggraph:     ${PINNED.pggraph}  (compose: infra/compose.pgctx.yaml)
pgcontext:   ${PINNED.pgcontext}  (GAP — not in compose yet)
vite-plus:   ${PINNED.vitePlus}
retrieval:   ${posture.retrievalMode}
degraded:    ${posture.degraded}
reason:      ${posture.reason ?? "n/a"}

Next: copy packages/ctx + packages/context-contract from a local core checkout.
Compose: docker compose -f infra/compose.pgctx.yaml up -d
`);
  return 0;
}

const CTX_LABEL = "@op0/ctx";

async function inspect(): Promise<number> {
  console.log(JSON.stringify(stubReadyz(), null, 2));
  return 0;
}

async function http(): Promise<number> {
  const { port, start } = createStubHttpServer();
  const server = await start();
  console.log(`@op0/ctx http stub listening on http://127.0.0.1:${port}`);
  console.log(`  GET  /health`);
  console.log(`  GET  /readyz  → degraded_lexical until pgcontext ${PINNED.pgcontext}`);
  console.log(`  POST /mcp`);
  console.log(`Ctrl+C to stop. Real engine: scripts/import-from-core.md`);
  await new Promise<void>((resolve) => {
    const stop = () => {
      server.close(() => resolve());
      process.off("SIGINT", stop);
      process.off("SIGTERM", stop);
    };
    process.on("SIGINT", stop);
    process.on("SIGTERM", stop);
  });
  return 0;
}

async function main(argv: string[]): Promise<number> {
  const cmd = argv[0] ?? "help";
  switch (cmd) {
    case "doctor":
      return doctor();
    case "inspect":
      return inspect();
    case "http":
      return http();
    case "help":
    case "--help":
    case "-h":
      printHelp();
      return 0;
    default:
      console.error(`Unknown command: ${cmd}\n`);
      printHelp();
      return 1;
  }
}

const code = await main(process.argv.slice(2));
process.exit(code);
