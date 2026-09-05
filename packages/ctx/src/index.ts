/**
 * @op0/ctx — scaffold stub for the context engine.
 *
 * Real implementation: op0ai/core packages/ctx (@op0/ctx).
 * Effect-native: leases, pocket_chunks, code_graph via Graphify, MCP search/health.
 * Depends on Evokoa pgGraph / pgContext — does not rewrite pgrx engines.
 *
 * Blocker: op0ai/core is private; copy via scripts/import-from-core.md.
 */

export {
  CONTRACT_PACKAGE,
  CONTRACT_STUB,
  type CodeGraphRequest,
  type CodeGraphResponse,
  type EvidenceHit,
  type Lease,
  type ReadyzBody,
  type RetrievalMode,
  type SearchRequest,
  type SearchResponse,
  type WorkspaceId,
} from "@op0/context-contract";

export { CTX_PACKAGE, CTX_STUB, designedPosture, stubReadyz } from "./posture.ts";
export { createStubHttpServer } from "./http/server.ts";
