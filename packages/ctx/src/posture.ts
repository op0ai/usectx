import type { ReadyzBody, RetrievalMode } from "@op0/context-contract";

export const CTX_PACKAGE = "@op0/ctx" as const;
export const CTX_STUB = true as const;

/** Catalog / engine pins this monorepo targets. */
export const PINNED = {
  effect: "4.0.0-rc.112",
  alchemy: "2.0.0-beta.74",
  graphify: "0.9.53",
  pggraph: "1.2.0",
  /** Not yet shipped in compose — hybrid RRF waits on this. */
  pgcontext: "0.3.0",
  vitePlus: "0.3.0",
} as const;

/**
 * Honest posture without a live pgcontext extension:
 * lexical retrieval over pggraph only (degraded vs designed hybrid RRF).
 */
export function designedPosture(opts?: {
  pggraphVersion?: string;
  pgcontextPresent?: boolean;
}): { retrievalMode: RetrievalMode; degraded: boolean; reason?: string } {
  if (opts?.pgcontextPresent) {
    return { retrievalMode: "hybrid", degraded: false };
  }
  return {
    retrievalMode: "degraded_lexical",
    degraded: true,
    reason:
      "pgcontext not loaded — retrieval is degraded lexical on pggraph. Pin pggraph 1.2.0; plan pgcontext 0.3.0 for hybrid RRF.",
  };
}

export function stubReadyz(): ReadyzBody {
  const posture = designedPosture({ pggraphVersion: PINNED.pggraph, pgcontextPresent: false });
  return {
    provider: "ctx",
    retrievalMode: posture.retrievalMode,
    pggraph: PINNED.pggraph,
    pgcontext: null,
    graphify: PINNED.graphify,
    degraded: posture.degraded,
    reason: posture.reason,
  };
}
