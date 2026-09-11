#!/usr/bin/env node

/**
 * usectx-hook.mjs — kit 0.4.2 fail-closed Cursor hook handler.
 *
 * Contract (Origin Empty-hook semantics):
 * - Always write valid JSON to stdout (never empty, never null).
 * - Decision shape is { permission, continue } plus optional user_message.
 * - op0mt_ tokens are restricted to agent_identity / action_invoke / packet_export.
 * - Non-restricted workspace bearers may not invoke workspace `clean`.
 * - Missing bearer, unknown events, and handler faults deny closed.
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { resolveCtxCliBearer } from "../bin/usectx-token.mjs";

export const OP0MT_ALLOWED_TOOLS = Object.freeze([
  "agent_identity",
  "action_invoke",
  "packet_export",
]);

export const WORKSPACE_DENIED_TOOLS = Object.freeze(["clean"]);

export function decision(permission, extra = {}) {
  const allow = permission === "allow";
  return {
    permission: allow ? "allow" : "deny",
    continue: allow,
    ...extra,
  };
}

export function failClosedDecision(userMessage) {
  return decision("deny", {
    user_message: userMessage,
  });
}

export function readInputFromStdin(fd = 0) {
  try {
    const raw = readFileSync(fd, "utf8").trim();
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export function resolveToolName(input = {}) {
  const raw =
    input.tool_name ??
    input.toolName ??
    input.tool ??
    input.name ??
    input.params?.name ??
    input.arguments?.name ??
    "";
  return typeof raw === "string" ? raw.trim() : "";
}

export function isRestrictedAgentToken(token) {
  return typeof token === "string" && token.startsWith("op0mt_");
}

export function isWorkspaceCleanTool(toolName) {
  const name = String(toolName ?? "").trim().toLowerCase();
  return WORKSPACE_DENIED_TOOLS.some(
    (denied) => name === denied || name.endsWith(`/${denied}`) || name.endsWith(`.${denied}`)
  );
}

export function handleSessionStart(input = {}, env = process.env, cwd = process.cwd()) {
  const bearer = resolveCtxCliBearer(env, cwd);
  if (!bearer.token) {
    return failClosedDecision(
      "Missing usectx bearer token. Run 'usectx login' or set CTX_HTTP_TOKEN."
    );
  }
  return decision("allow", {
    user_message: "Bearer token verified.",
  });
}

export function handleBeforeSubmitPrompt(input = {}, env = process.env, cwd = process.cwd()) {
  const bearer = resolveCtxCliBearer(env, cwd);
  if (!bearer.token) {
    return failClosedDecision(
      "Missing usectx bearer token. Cannot submit prompt without authentication."
    );
  }
  return decision("allow", {
    user_message: "Prompt submission allowed.",
  });
}

export function handleBeforeMCPExecution(input = {}, env = process.env, cwd = process.cwd()) {
  const bearer = resolveCtxCliBearer(env, cwd);
  const token = bearer.token;
  const toolName = resolveToolName(input);

  if (!token) {
    return failClosedDecision("Denied: Bearer token is missing. MCP execution fails closed.");
  }

  if (isRestrictedAgentToken(token)) {
    if (!toolName) {
      return failClosedDecision("Denied: Tool name required for op0mt_ scoped authorization.");
    }
    if (!OP0MT_ALLOWED_TOOLS.includes(toolName)) {
      return failClosedDecision(
        `Denied: Tool '${toolName}' is not permitted for op0mt_ agent tokens. Permitted catalog: ${OP0MT_ALLOWED_TOOLS.join(", ")}.`
      );
    }
    return decision("allow", {
      user_message: `Allowed: Tool '${toolName}' authorized for op0mt_ token.`,
    });
  }

  if (isWorkspaceCleanTool(toolName)) {
    return failClosedDecision(
      "Denied: Workspace 'clean' is not permitted for non-restricted tokens."
    );
  }

  return decision("allow", {
    user_message: "Allowed: MCP execution authorized for bearer token.",
  });
}

export function handleSessionEnd() {
  return decision("allow", {
    user_message: "Session ended cleanly.",
  });
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
      return failClosedDecision(`Unknown hook event: '${eventType}'. Fails closed.`);
  }
}

export function resolveHookEvent(argv = process.argv, input = {}, env = process.env) {
  const fromArgv = typeof argv[2] === "string" ? argv[2].trim() : "";
  if (fromArgv) return fromArgv;
  const fromEnv =
    (typeof env.CURSOR_HOOK_EVENT === "string" && env.CURSOR_HOOK_EVENT.trim()) ||
    (typeof env.HOOK_EVENT === "string" && env.HOOK_EVENT.trim()) ||
    "";
  if (fromEnv) return fromEnv;
  const fromInput =
    (typeof input.hook_event_name === "string" && input.hook_event_name.trim()) ||
    (typeof input.event === "string" && input.event.trim()) ||
    "";
  if (fromInput) return fromInput;
  return "";
}

export function normalizeHookResult(result) {
  if (result && typeof result === "object" && !Array.isArray(result)) {
    const permission = result.permission === "allow" ? "allow" : "deny";
    return {
      permission,
      continue: permission === "allow" && result.continue !== false,
      ...(typeof result.user_message === "string" ? { user_message: result.user_message } : {}),
    };
  }
  return failClosedDecision("usectx hook produced no result. Fails closed.");
}

export function writeHookStdout(result, stdout = process.stdout) {
  const payload = normalizeHookResult(result);
  stdout.write(`${JSON.stringify(payload)}\n`);
  return payload;
}

export function main(argv = process.argv, env = process.env, cwd = process.cwd(), io = process) {
  let payload;
  try {
    const input = readInputFromStdin(0);
    const eventType = resolveHookEvent(argv, input, env);
    payload = normalizeHookResult(runHook(eventType, input, env, cwd));
  } catch {
    payload = failClosedDecision("usectx hook failed closed.");
  }
  writeHookStdout(payload, io.stdout);
  // Exit 0 so Cursor parses stdout JSON. deny + failClosed block the action.
  io.exit(0);
}

const invokedDirectly =
  process.argv[1] !== undefined &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (import.meta.main || invokedDirectly) {
  main();
}
