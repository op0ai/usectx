/**
 * @op0/context-contract — scaffold stub.
 *
 * Replace this package by copying from a local op0ai/core checkout:
 *   packages/context-contract → packages/context-contract
 * See scripts/import-from-core.md.
 *
 * Blocker: op0ai/core is private; this agent could not fetch sources via GitHub API.
 */

/** Workspace-scoped bearer claim surface (ctx_ws_*). */
export type WorkspaceId = string & { readonly __brand: "WorkspaceId" };

/** Lease issued by the Door after bearer validation. */
export interface Lease {
  readonly leaseId: string;
  readonly workspaceId: WorkspaceId;
  readonly issuedAt: number;
  readonly expiresAt: number;
  readonly scope: ReadonlyArray<string>;
}

/** Settled evidence hit returned by hybrid / lexical search. */
export interface EvidenceHit {
  readonly sourceId: string;
  readonly content: string;
  readonly score: number;
  readonly citation?: {
    readonly path?: string;
    readonly startLine?: number;
    readonly endLine?: number;
  };
}

/** MCP / HTTP search request shape. */
export interface SearchRequest {
  readonly query: string;
  readonly limit?: number;
  readonly leaseId?: string;
}

export interface SearchResponse {
  readonly evidence: ReadonlyArray<EvidenceHit>;
  readonly retrievalMode: RetrievalMode;
  readonly leaseId?: string;
}

/**
 * Designed spine: hybrid RRF via pgcontext.
 * Honest degradation today without pgcontext: lexical on pggraph.
 */
export type RetrievalMode = "hybrid" | "lexical" | "degraded_lexical";

/** code_graph hop request (Graphify-backed). */
export interface CodeGraphRequest {
  readonly symbol: string;
  readonly depth?: number;
  readonly direction?: "callers" | "callees" | "any";
}

export interface CodeGraphNode {
  readonly symbol: string;
  readonly path?: string;
  readonly kind?: string;
}

export interface CodeGraphEdge {
  readonly from: string;
  readonly to: string;
  readonly relation: string;
}

export interface CodeGraphResponse {
  readonly nodes: ReadonlyArray<CodeGraphNode>;
  readonly edges: ReadonlyArray<CodeGraphEdge>;
}

/** Readiness / doctor posture. */
export interface ReadyzBody {
  readonly provider: "ctx";
  readonly retrievalMode: RetrievalMode;
  readonly pggraph?: string;
  readonly pgcontext?: string | null;
  readonly graphify?: string;
  readonly degraded?: boolean;
  readonly reason?: string;
}

export const CONTRACT_PACKAGE = "@op0/context-contract" as const;
export const CONTRACT_STUB = true as const;
