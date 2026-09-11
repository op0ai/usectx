import test from "node:test";
import assert from "node:assert/strict";
import { resolve, dirname } from "node:path";
import { readFileSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import {
  handleSessionStart,
  handleBeforeSubmitPrompt,
  handleBeforeMCPExecution,
  handleSessionEnd,
  runHook,
  writeHookStdout,
  normalizeHookResult,
  OP0MT_ALLOWED_TOOLS,
  WORKSPACE_DENIED_TOOLS,
} from "../hooks/usectx-hook.mjs";

import {
  validateHooksConfig,
  validateHooksFile,
  FAIL_CLOSED_EVENTS,
} from "../bin/usectx-validate-hooks.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const REPO_ROOT = resolve(__dirname, "..");
const HOOKS_JSON_PATH = resolve(REPO_ROOT, "hooks", "hooks.json");
const ROOT_HOOKS_JSON_PATH = resolve(REPO_ROOT, "hooks.json");
const HOOK_SCRIPT = resolve(REPO_ROOT, "hooks", "usectx-hook.mjs");
const NODE_HOOK_COMMAND = "node ./hooks/usectx-hook.mjs";

function readHooksJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function validCommand(event) {
  const base = { command: `${NODE_HOOK_COMMAND} ${event}` };
  if (FAIL_CLOSED_EVENTS.includes(event)) {
    return { ...base, failClosed: true };
  }
  return base;
}

test("hooks/hooks.json: exists, is valid JSON, and has version >= 1", () => {
  assert.equal(existsSync(HOOKS_JSON_PATH), true, "hooks/hooks.json must exist");
  const parsed = readHooksJson(HOOKS_JSON_PATH);
  assert.equal(parsed.version, 1);
  assert.equal(typeof parsed.hooks, "object");
});

test("root hooks.json matches hooks/hooks.json (GH layout adaptation)", () => {
  assert.equal(existsSync(ROOT_HOOKS_JSON_PATH), true);
  assert.deepEqual(readHooksJson(ROOT_HOOKS_JSON_PATH), readHooksJson(HOOKS_JSON_PATH));
});

test("hooks.json: commands use node ./hooks/usectx-hook.mjs and failClosed on security events", () => {
  const parsed = readHooksJson(HOOKS_JSON_PATH);
  const required = ["sessionStart", "beforeSubmitPrompt", "beforeMCPExecution", "sessionEnd"];

  for (const hookName of required) {
    const handlers = parsed.hooks[hookName];
    assert.equal(Array.isArray(handlers), true, `${hookName} must be an array`);
    assert.ok(handlers.length > 0, `${hookName} must not be empty`);

    for (let i = 0; i < handlers.length; i++) {
      const handler = handlers[i];
      assert.equal(typeof handler.command, "string");
      assert.ok(handler.command.trim().length > 0, `${hookName}[${i}].command must be non-empty`);
      assert.ok(
        handler.command.startsWith(NODE_HOOK_COMMAND),
        `${hookName}[${i}].command must run via ${NODE_HOOK_COMMAND}`
      );
      if (FAIL_CLOSED_EVENTS.includes(hookName)) {
        assert.equal(handler.failClosed, true, `${hookName} must set failClosed: true`);
      }
    }
  }
});

test("validate-hooks gate: validates repo hooks/hooks.json successfully", () => {
  const result = validateHooksFile(HOOKS_JSON_PATH, REPO_ROOT);
  assert.equal(result.valid, true, `Validation errors: ${result.errors.join(", ")}`);
  assert.equal(result.errors.length, 0);
});

test("validate-hooks gate: validates root hooks.json successfully", () => {
  const result = validateHooksFile(ROOT_HOOKS_JSON_PATH, REPO_ROOT);
  assert.equal(result.valid, true, `Validation errors: ${result.errors.join(", ")}`);
});

test("validate-hooks gate: rejects empty hook shapes and missing failClosed", () => {
  const emptyCommandConfig = {
    version: 1,
    hooks: {
      sessionStart: [{ command: "" }],
      beforeSubmitPrompt: [validCommand("beforeSubmitPrompt")],
      beforeMCPExecution: [validCommand("beforeMCPExecution")],
      sessionEnd: [validCommand("sessionEnd")],
    },
  };
  const res1 = validateHooksConfig(emptyCommandConfig, REPO_ROOT);
  assert.equal(res1.valid, false);
  assert.ok(res1.errors.some((e) => e.includes("Empty hook is not allowed")));

  const whitespaceCommandConfig = {
    version: 1,
    hooks: {
      sessionStart: [{ command: "   " }],
      beforeSubmitPrompt: [validCommand("beforeSubmitPrompt")],
      beforeMCPExecution: [validCommand("beforeMCPExecution")],
      sessionEnd: [validCommand("sessionEnd")],
    },
  };
  const res2 = validateHooksConfig(whitespaceCommandConfig, REPO_ROOT);
  assert.equal(res2.valid, false);
  assert.ok(res2.errors.some((e) => e.includes("Empty hook is not allowed")));

  const emptyArrayConfig = {
    version: 1,
    hooks: {
      sessionStart: [],
      beforeSubmitPrompt: [validCommand("beforeSubmitPrompt")],
      beforeMCPExecution: [validCommand("beforeMCPExecution")],
      sessionEnd: [validCommand("sessionEnd")],
    },
  };
  const res3 = validateHooksConfig(emptyArrayConfig, REPO_ROOT);
  assert.equal(res3.valid, false);
  assert.ok(res3.errors.some((e) => e.includes("Empty hook is not allowed")));

  const missingHookConfig = {
    version: 1,
    hooks: {
      sessionStart: [validCommand("sessionStart")],
    },
  };
  const res4 = validateHooksConfig(missingHookConfig, REPO_ROOT);
  assert.equal(res4.valid, false);
  assert.ok(res4.errors.some((e) => e.includes("Missing required security hook")));

  const nonExistentScriptConfig = {
    version: 1,
    hooks: {
      sessionStart: [{ command: "node ./hooks/does-not-exist.mjs sessionStart" }],
      beforeSubmitPrompt: [validCommand("beforeSubmitPrompt")],
      beforeMCPExecution: [validCommand("beforeMCPExecution")],
      sessionEnd: [validCommand("sessionEnd")],
    },
  };
  const res5 = validateHooksConfig(nonExistentScriptConfig, REPO_ROOT);
  assert.equal(res5.valid, false);
  assert.ok(res5.errors.some((e) => e.includes("Hook script not found")));

  const missingFailClosed = {
    version: 1,
    hooks: {
      sessionStart: [validCommand("sessionStart")],
      beforeSubmitPrompt: [{ command: `${NODE_HOOK_COMMAND} beforeSubmitPrompt` }],
      beforeMCPExecution: [validCommand("beforeMCPExecution")],
      sessionEnd: [validCommand("sessionEnd")],
    },
  };
  const res6 = validateHooksConfig(missingFailClosed, REPO_ROOT);
  assert.equal(res6.valid, false);
  assert.ok(res6.errors.some((e) => e.includes("failClosed: true")));
});

test("hook script: always returns non-null {permission, continue} JSON", () => {
  const events = [
    "sessionStart",
    "beforeSubmitPrompt",
    "beforeMCPExecution",
    "sessionEnd",
    "unknownEvent",
  ];
  for (const event of events) {
    const res = runHook(event, {}, {});
    assert.equal(typeof res, "object");
    assert.notEqual(res, null);
    assert.ok(res.permission === "allow" || res.permission === "deny");
    assert.equal(typeof res.continue, "boolean");
    assert.equal(res.continue, res.permission === "allow");
    const normalized = normalizeHookResult(res);
    assert.equal(normalized.permission, res.permission);
    assert.equal(normalized.continue, res.continue);
  }
});

test("hook script: writeHookStdout never emits null or empty output", () => {
  const chunks = [];
  writeHookStdout(null, { write: (s) => chunks.push(s) });
  writeHookStdout(undefined, { write: (s) => chunks.push(s) });
  writeHookStdout("not-json-object", { write: (s) => chunks.push(s) });
  assert.equal(chunks.length, 3);
  for (const chunk of chunks) {
    assert.ok(chunk.trim().length > 0);
    const parsed = JSON.parse(chunk);
    assert.notEqual(parsed, null);
    assert.equal(parsed.permission, "deny");
    assert.equal(parsed.continue, false);
  }
});

test("hook script: sessionStart requires bearer and fails closed without one", () => {
  const denied = handleSessionStart({}, {}, "/tmp");
  assert.equal(denied.permission, "deny");
  assert.equal(denied.continue, false);
  assert.ok(denied.user_message.includes("Missing usectx bearer"));

  const allowed = handleSessionStart({}, { CTX_HTTP_TOKEN: "ctx_ws_mock_token" }, "/tmp");
  assert.equal(allowed.permission, "allow");
  assert.equal(allowed.continue, true);
});

test("hook script: beforeSubmitPrompt requires bearer and fails closed without one", () => {
  const denied = handleBeforeSubmitPrompt({}, {}, "/tmp");
  assert.equal(denied.permission, "deny");
  assert.equal(denied.continue, false);
  assert.ok(denied.user_message.includes("Missing usectx bearer"));

  const allowed = handleBeforeSubmitPrompt({}, { CTX_HTTP_TOKEN: "ctx_ws_mock_token" }, "/tmp");
  assert.equal(allowed.permission, "allow");
  assert.equal(allowed.continue, true);
});

test("hook script: beforeMCPExecution fails closed without bearer", () => {
  const denied = handleBeforeMCPExecution({ tool_name: "search" }, {}, "/tmp");
  assert.equal(denied.permission, "deny");
  assert.equal(denied.continue, false);
  assert.ok(denied.user_message.includes("Bearer token is missing"));
});

test("hook script: beforeMCPExecution allows regular workspace tokens for general tools", () => {
  const env = { CTX_HTTP_TOKEN: "ctx_ws_regular_user_token" };
  const allowed = handleBeforeMCPExecution({ tool_name: "search" }, env, "/tmp");
  assert.equal(allowed.permission, "allow");
  assert.equal(allowed.continue, true);
  assert.ok(allowed.user_message.includes("MCP execution authorized"));
});

test("hook script: beforeMCPExecution denies workspace clean for non-restricted tokens", () => {
  const env = { CTX_HTTP_TOKEN: "ctx_ws_regular_user_token" };
  assert.deepEqual(WORKSPACE_DENIED_TOOLS, ["clean"]);

  for (const toolName of ["clean", "workspace.clean", "usectx/clean"]) {
    const denied = handleBeforeMCPExecution({ tool_name: toolName }, env, "/tmp");
    assert.equal(denied.permission, "deny", `Tool '${toolName}' must be denied for workspace tokens`);
    assert.equal(denied.continue, false);
    assert.ok(denied.user_message.includes("clean"));
  }
});

test("hook script: beforeMCPExecution strictly restricts op0mt_ agent tokens to allowed catalog", () => {
  const env = { CTX_HTTP_TOKEN: "op0mt_agent_scoped_token" };

  assert.deepEqual(OP0MT_ALLOWED_TOOLS, ["agent_identity", "action_invoke", "packet_export"]);

  for (const allowedTool of OP0MT_ALLOWED_TOOLS) {
    const res = handleBeforeMCPExecution({ tool_name: allowedTool }, env, "/tmp");
    assert.equal(res.permission, "allow", `Tool '${allowedTool}' should be allowed under op0mt_`);
    assert.equal(res.continue, true);
    assert.ok(res.user_message.includes("authorized for op0mt_ token"));
  }

  const forbiddenTools = [
    "search",
    "code_graph",
    "bash",
    "execute",
    "arbitrary_tool",
    "delete_file",
    "clean",
  ];
  for (const forbiddenTool of forbiddenTools) {
    const res = handleBeforeMCPExecution({ tool_name: forbiddenTool }, env, "/tmp");
    assert.equal(res.permission, "deny", `Tool '${forbiddenTool}' should be denied under op0mt_`);
    assert.equal(res.continue, false);
    assert.ok(res.user_message.includes("is not permitted for op0mt_ agent tokens"));
  }

  const missingTool = handleBeforeMCPExecution({}, env, "/tmp");
  assert.equal(missingTool.permission, "deny");
  assert.equal(missingTool.continue, false);
  assert.ok(missingTool.user_message.includes("Tool name required"));
});

test("hook script: CLI execution via child_process produces non-empty JSON on stdout", () => {
  const isolatedEnv = {
    PATH: process.env.PATH,
    HOME: "/tmp/usectx-hook-test-home",
  };
  const out1 = execFileSync("node", [HOOK_SCRIPT, "sessionStart"], {
    encoding: "utf8",
    env: isolatedEnv,
    input: "{}",
  });
  assert.ok(out1.trim().length > 0);
  const parsed1 = JSON.parse(out1);
  assert.equal(parsed1.permission, "deny");
  assert.equal(parsed1.continue, false);

  const out2 = execFileSync("node", [HOOK_SCRIPT, "beforeMCPExecution"], {
    encoding: "utf8",
    env: { ...process.env, CTX_HTTP_TOKEN: "op0mt_test_token" },
    input: JSON.stringify({ tool_name: "agent_identity" }),
  });
  assert.ok(out2.trim().length > 0);
  const parsed2 = JSON.parse(out2);
  assert.equal(parsed2.permission, "allow");
  assert.equal(parsed2.continue, true);

  const out3 = execFileSync("node", [HOOK_SCRIPT, "beforeMCPExecution"], {
    encoding: "utf8",
    env: { ...process.env, CTX_HTTP_TOKEN: "op0mt_test_token" },
    input: JSON.stringify({ tool_name: "unauthorized_tool" }),
  });
  assert.ok(out3.trim().length > 0);
  const parsed3 = JSON.parse(out3);
  assert.equal(parsed3.permission, "deny");
  assert.equal(parsed3.continue, false);

  const out4 = execFileSync("node", [HOOK_SCRIPT, "beforeMCPExecution"], {
    encoding: "utf8",
    env: { ...process.env, CTX_HTTP_TOKEN: "ctx_ws_regular_user_token" },
    input: JSON.stringify({ tool_name: "clean" }),
  });
  const parsed4 = JSON.parse(out4);
  assert.equal(parsed4.permission, "deny");
  assert.equal(parsed4.continue, false);
});

test("CLI: `usectx validate-hooks` passes", () => {
  const usectxBin = resolve(REPO_ROOT, "bin/usectx");
  const stdout = execFileSync("node", [usectxBin, "validate-hooks"], {
    encoding: "utf8",
  });
  assert.ok(stdout.includes("is valid and all hooks are non-empty"));
});

test("MCP examples: human (CTX_HTTP_TOKEN) and agent (op0mt_) configs exist and are separated", () => {
  const humanPath = resolve(REPO_ROOT, "examples/cursor.mcp.json");
  const agentPath = resolve(REPO_ROOT, "examples/cursor.agent.mcp.json");

  assert.equal(existsSync(humanPath), true, "cursor.mcp.json must exist");
  assert.equal(existsSync(agentPath), true, "cursor.agent.mcp.json must exist");

  const human = JSON.parse(readFileSync(humanPath, "utf8"));
  const agent = JSON.parse(readFileSync(agentPath, "utf8"));

  assert.ok(
    human.mcpServers.usectx.headers.Authorization.includes("CTX_HTTP_TOKEN"),
    "Human MCP example must use CTX_HTTP_TOKEN"
  );
  assert.ok(
    agent.mcpServers.usectx.headers.Authorization.includes("op0mt_"),
    "Agent MCP example must use op0mt_"
  );
});
