#!/usr/bin/env node

/**
 * usectx-hook.mjs - Security and session hook handler for usectx
 *
 * Enforces fail-closed JSON allow/deny semantics:
 * - sessionStart: verify bearer readiness or refuse closed
 * - beforeSubmitPrompt: ensure bearer exists before prompt submission
 * - beforeMCPExecution: fail-closed authorization gate; for op0mt_ tokens,
 *   strictly restrict tool catalog to:
 *     - agent_identity
 *     - action_invoke
 *     - packet_export
 *   All other tools are denied under op0mt_.
 *   Missing bearer or invalid token denies cleanly.
 * - sessionEnd: clean shutdown / audit confirmation
 *
 * Contract:
 * Always outputs valid JSON (never empty or null).
 */

import process from "node:process";
import { readFileSync } from "node:fs";
import { resolveCtxCliBearer } from "./usectx-token.mjs";

export const OP0MT_ALLOWED_TOOLS = Object.freeze([
  "agent_identity",
  "action_invoke",
  "packet_export",
]);

export function readInputFromStdin(fd = 0) {
  try {
    const raw = readFileSync(fd, "utf8").trim();
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export function handleSessionStart(input = {}, env = process.env, cwd = process.cwd()) {
  const bearer = resolveCtxCliBearer(env, cwd);
  if (!bearer.token) {
    return {
      allowed: false,
      reason: "Missing usectx bearer token. Run 'usectx login' or set CTX_HTTP_TOKEN.",
      additional_context: "usectx: sessionStart refused (no bearer token available).",
    };
  }
  return {
    allowed: true,
    reason: "Bearer token verified.",
    additional_context: "usectx: sessionStart authorized with active bearer.",
  };
}

export function handleBeforeSubmitPrompt(input = {}, env = process.env, cwd = process.cwd()) {
  const bearer = resolveCtxCliBearer(env, cwd);
  if (!bearer.token) {
    return {
      allowed: false,
      reason: "Missing usectx bearer token. Cannot submit prompt without authentication.",
      additional_context: "usectx: prompt submission refused (unauthenticated session).",
    };
  }
  return {
    allowed: true,
    reason: "Prompt submission allowed.",
  };
}

export function handleBeforeMCPExecution(input = {}, env = process.env, cwd = process.cwd()) {
  const bearer = resolveCtxCliBearer(env, cwd);
  const token = bearer.token;

  if (!token) {
    return {
      allowed: false,
      reason: "Denied: Bearer token is missing. MCP execution fails closed.",
    };
  }

  // Extract tool name from input payload
  const toolName =
    input.tool_name ||
    input.toolName ||
    input.tool ||
    input.name ||
    input.params?.name ||
    input.arguments?.name ||
    "";

  // Check if token is an agent token (op0mt_ prefix)
  const isOp0mt = token.startsWith("op0mt_");

  if (isOp0mt) {
    if (!toolName) {
      return {
        allowed: false,
        reason: "Denied: Tool name required for op0mt_ scoped authorization.",
      };
    }

    if (!OP0MT_ALLOWED_TOOLS.includes(toolName)) {
      return {
        allowed: false,
        reason: `Denied: Tool '${toolName}' is not permitted for op0mt_ agent tokens. Permitted catalog: ${OP0MT_ALLOWED_TOOLS.join(", ")}.`,
      };
    }

    return {
      allowed: true,
      reason: `Allowed: Tool '${toolName}' authorized for op0mt_ token.`,
    };
  }

  // Standard human/workspace tokens (e.g. ctx_ws_ or regular bearers)
  return {
    allowed: true,
    reason: `Allowed: MCP execution authorized for bearer token.`,
  };
}

export function handleSessionEnd(input = {}, env = process.env, cwd = process.cwd()) {
  return {
    allowed: true,
    reason: "Session ended cleanly.",
  };
}

export function runHook(eventType, input = {}, env = process.env, cwd = process.cwd()) {
  switch (eventType) {
    case "sessionStart":
      return handleSessionStart(input, env, cwd);
    case "beforeSubmitPrompt":
      return handleBeforeSubmitPrompt(input, env, cwd);
    case "beforeMCPExecution":
      return handleBeforeMCPExecution(input, env, cwd);
    case "sessionEnd":
      return handleSessionEnd(input, env, cwd);
    default:
      // Any unknown hook fails closed cleanly
      return {
        allowed: false,
        reason: `Unknown hook event: '${eventType}'. Fails closed.`,
      };
  }
}

export function main() {
  const hookName = process.argv[2] || process.env.CURSOR_HOOK_EVENT || "";
  const input = readInputFromStdin(0);
  const result = runHook(hookName, input, process.env, process.cwd());

  const jsonStr = JSON.stringify(result, null, 2);
  process.stdout.write(`${jsonStr}\n`);

  // Exit with non-zero if disallowed and fail-closed requested, or exit 0 with allowed: false JSON
  // Cursor hooks inspect stdout JSON { allowed: false, reason: "..." }.
  // Exit code 0 ensures Cursor receives and parses the clean JSON output.
  process.exit(0);
}

if (import.meta.main || (process.argv[1] && process.argv[1].endsWith("usectx-hook.mjs"))) {
  main();
}
