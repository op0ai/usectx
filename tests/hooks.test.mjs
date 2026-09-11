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
  OP0MT_ALLOWED_TOOLS,
} from "../bin/usectx-hook.mjs";

import {
  validateHooksConfig,
  validateHooksFile,
} from "../bin/usectx-validate-hooks.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const REPO_ROOT = resolve(__dirname, "..");
const HOOKS_JSON_PATH = resolve(REPO_ROOT, "hooks.json");

test("hooks.json: exists, is valid JSON, and has version >= 1", () => {
  assert.equal(existsSync(HOOKS_JSON_PATH), true, "hooks.json must exist in repo root");
  const raw = readFileSync(HOOKS_JSON_PATH, "utf8");
  const parsed = JSON.parse(raw);
  assert.equal(parsed.version, 1);
  assert.equal(typeof parsed.hooks, "object");
});

test("hooks.json: all required security hooks are declared and non-empty", () => {
  const parsed = JSON.parse(readFileSync(HOOKS_JSON_PATH, "utf8"));
  const required = ["sessionStart", "beforeSubmitPrompt", "beforeMCPExecution", "sessionEnd"];

  for (const hookName of required) {
    const handlers = parsed.hooks[hookName];
    assert.equal(Array.isArray(handlers), true, `${hookName} must be an array`);
    assert.ok(handlers.length > 0, `${hookName} must not be empty`);

    for (let i = 0; i < handlers.length; i++) {
      const handler = handlers[i];
      assert.equal(typeof handler.command, "string");
      assert.ok(
        handler.command.trim().length > 0,
        `${hookName}[${i}].command must be non-empty`
      );
      assert.notEqual(
        handler.command.trim(),
        "",
        `Empty hook is not allowed in ${hookName}`
      );
    }
  }
});

test("validate-hooks gate: validates repo hooks.json successfully", () => {
  const result = validateHooksFile(HOOKS_JSON_PATH, REPO_ROOT);
  assert.equal(result.valid, true, `Validation errors: ${result.errors.join(", ")}`);
  assert.equal(result.errors.length, 0);
});

test("validate-hooks gate: rejects empty hook shapes with 'Empty hook is not allowed'", () => {
  // Empty command string
  const emptyCommandConfig = {
    version: 1,
    hooks: {
      sessionStart: [{ command: "" }],
      beforeSubmitPrompt: [{ command: "./bin/usectx-hook.mjs" }],
      beforeMCPExecution: [{ command: "./bin/usectx-hook.mjs" }],
      sessionEnd: [{ command: "./bin/usectx-hook.mjs" }],
    },
  };
  const res1 = validateHooksConfig(emptyCommandConfig, REPO_ROOT);
  assert.equal(res1.valid, false);
  assert.ok(res1.errors.some((e) => e.includes("Empty hook is not allowed")));

  // Whitespace only command
  const whitespaceCommandConfig = {
    version: 1,
    hooks: {
      sessionStart: [{ command: "   " }],
      beforeSubmitPrompt: [{ command: "./bin/usectx-hook.mjs" }],
      beforeMCPExecution: [{ command: "./bin/usectx-hook.mjs" }],
      sessionEnd: [{ command: "./bin/usectx-hook.mjs" }],
    },
  };
  const res2 = validateHooksConfig(whitespaceCommandConfig, REPO_ROOT);
  assert.equal(res2.valid, false);
  assert.ok(res2.errors.some((e) => e.includes("Empty hook is not allowed")));

  // Empty handler array
  const emptyArrayConfig = {
    version: 1,
    hooks: {
      sessionStart: [],
      beforeSubmitPrompt: [{ command: "./bin/usectx-hook.mjs" }],
      beforeMCPExecution: [{ command: "./bin/usectx-hook.mjs" }],
      sessionEnd: [{ command: "./bin/usectx-hook.mjs" }],
    },
  };
  const res3 = validateHooksConfig(emptyArrayConfig, REPO_ROOT);
  assert.equal(res3.valid, false);
  assert.ok(res3.errors.some((e) => e.includes("Empty hook is not allowed")));

  // Missing required hook
  const missingHookConfig = {
    version: 1,
    hooks: {
      sessionStart: [{ command: "./bin/usectx-hook.mjs" }],
      // missing beforeSubmitPrompt, beforeMCPExecution, sessionEnd
    },
  };
  const res4 = validateHooksConfig(missingHookConfig, REPO_ROOT);
  assert.equal(res4.valid, false);
  assert.ok(res4.errors.some((e) => e.includes("Missing required security hook")));

  // Referencing non-existent script
  const nonExistentScriptConfig = {
    version: 1,
    hooks: {
      sessionStart: [{ command: "./bin/does-not-exist.sh" }],
      beforeSubmitPrompt: [{ command: "./bin/usectx-hook.mjs" }],
      beforeMCPExecution: [{ command: "./bin/usectx-hook.mjs" }],
      sessionEnd: [{ command: "./bin/usectx-hook.mjs" }],
    },
  };
  const res5 = validateHooksConfig(nonExistentScriptConfig, REPO_ROOT);
  assert.equal(res5.valid, false);
  assert.ok(res5.errors.some((e) => e.includes("Hook script not found")));
});

test("hook script: always returns non-null, valid JSON objects with allowed boolean", () => {
  const events = ["sessionStart", "beforeSubmitPrompt", "beforeMCPExecution", "sessionEnd", "unknownEvent"];
  for (const event of events) {
    const res = runHook(event, {}, {});
    assert.equal(typeof res, "object");
    assert.notEqual(res, null);
    assert.equal(typeof res.allowed, "boolean");
    assert.equal(typeof res.reason, "string");
  }
});

test("hook script: sessionStart requires bearer and fails closed without one", () => {
  // Without bearer
  const denied = handleSessionStart({}, {}, "/tmp");
  assert.equal(denied.allowed, false);
  assert.ok(denied.reason.includes("Missing usectx bearer"));

  // With bearer
  const allowed = handleSessionStart({}, { CTX_HTTP_TOKEN: "ctx_ws_mock_token" }, "/tmp");
  assert.equal(allowed.allowed, true);
  assert.ok(allowed.reason.includes("Bearer token verified"));
});

test("hook script: beforeSubmitPrompt requires bearer and fails closed without one", () => {
  // Without bearer
  const denied = handleBeforeSubmitPrompt({}, {}, "/tmp");
  assert.equal(denied.allowed, false);
  assert.ok(denied.reason.includes("Missing usectx bearer"));

  // With bearer
  const allowed = handleBeforeSubmitPrompt({}, { CTX_HTTP_TOKEN: "ctx_ws_mock_token" }, "/tmp");
  assert.equal(allowed.allowed, true);
  assert.ok(allowed.reason.includes("Prompt submission allowed"));
});

test("hook script: beforeMCPExecution fails closed without bearer", () => {
  const denied = handleBeforeMCPExecution({ tool_name: "search" }, {}, "/tmp");
  assert.equal(denied.allowed, false);
  assert.ok(denied.reason.includes("Bearer token is missing"));
});

test("hook script: beforeMCPExecution allows regular workspace tokens for general tools", () => {
  const env = { CTX_HTTP_TOKEN: "ctx_ws_regular_user_token" };
  const allowed = handleBeforeMCPExecution({ tool_name: "search" }, env, "/tmp");
  assert.equal(allowed.allowed, true);
  assert.ok(allowed.reason.includes("MCP execution authorized"));
});

test("hook script: beforeMCPExecution strictly restricts op0mt_ agent tokens to allowed catalog", () => {
  const env = { CTX_HTTP_TOKEN: "op0mt_agent_scoped_token" };

  // Exactly 3 tools are permitted: agent_identity, action_invoke, packet_export
  assert.deepEqual(OP0MT_ALLOWED_TOOLS, ["agent_identity", "action_invoke", "packet_export"]);

  for (const allowedTool of OP0MT_ALLOWED_TOOLS) {
    const res = handleBeforeMCPExecution({ tool_name: allowedTool }, env, "/tmp");
    assert.equal(res.allowed, true, `Tool '${allowedTool}' should be allowed under op0mt_`);
    assert.ok(res.reason.includes("authorized for op0mt_ token"));
  }

  // Any other tool must be denied cleanly
  const forbiddenTools = ["search", "code_graph", "bash", "execute", "arbitrary_tool", "delete_file"];
  for (const forbiddenTool of forbiddenTools) {
    const res = handleBeforeMCPExecution({ tool_name: forbiddenTool }, env, "/tmp");
    assert.equal(res.allowed, false, `Tool '${forbiddenTool}' should be denied under op0mt_`);
    assert.ok(res.reason.includes("is not permitted for op0mt_ agent tokens"));
  }

  // Missing tool name under op0mt_ also fails closed
  const missingTool = handleBeforeMCPExecution({}, env, "/tmp");
  assert.equal(missingTool.allowed, false);
  assert.ok(missingTool.reason.includes("Tool name required"));
});

test("hook script: CLI execution via child_process produces non-empty JSON on stdout", () => {
  const hookScript = resolve(REPO_ROOT, "bin/usectx-hook.mjs");

  // Run sessionStart without token
  const out1 = execFileSync("node", [hookScript, "sessionStart"], {
    encoding: "utf8",
    env: { ...process.env, CTX_HTTP_TOKEN: "" },
    input: "{}",
  });
  assert.ok(out1.trim().length > 0);
  const parsed1 = JSON.parse(out1);
  assert.equal(parsed1.allowed, false);

  // Run beforeMCPExecution with op0mt_ and allowed tool
  const out2 = execFileSync("node", [hookScript, "beforeMCPExecution"], {
    encoding: "utf8",
    env: { ...process.env, CTX_HTTP_TOKEN: "op0mt_test_token" },
    input: JSON.stringify({ tool_name: "agent_identity" }),
  });
  assert.ok(out2.trim().length > 0);
  const parsed2 = JSON.parse(out2);
  assert.equal(parsed2.allowed, true);

  // Run beforeMCPExecution with op0mt_ and disallowed tool
  const out3 = execFileSync("node", [hookScript, "beforeMCPExecution"], {
    encoding: "utf8",
    env: { ...process.env, CTX_HTTP_TOKEN: "op0mt_test_token" },
    input: JSON.stringify({ tool_name: "unauthorized_tool" }),
  });
  assert.ok(out3.trim().length > 0);
  const parsed3 = JSON.parse(out3);
  assert.equal(parsed3.allowed, false);
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
