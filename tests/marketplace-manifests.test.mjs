import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { handleSessionStart, handleBeforeMCPExecution } from "../hooks/usectx-hook.mjs";
import { applyResolvedBearerToEnv, resolveCtxCliBearer } from "../bin/usectx-token.mjs";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const KIT_VERSION = "0.4.2";

const MANIFEST_PATHS = {
  agentPlugin: resolve(REPO_ROOT, "plugin.json"),
  cursorPlugin: resolve(REPO_ROOT, ".cursor-plugin/plugin.json"),
  cursorMcp: resolve(REPO_ROOT, ".cursor-plugin/mcp.json"),
  grokPlugin: resolve(REPO_ROOT, ".grok-plugin/plugin.json"),
  grokMarketplace: resolve(REPO_ROOT, ".grok-plugin/marketplace.json"),
  claudePlugin: resolve(REPO_ROOT, ".claude-plugin/plugin.json"),
  packMcp: resolve(REPO_ROOT, "mcp.json"),
  xaiEntry: resolve(REPO_ROOT, "docs/marketplace/xai-official.entry.json"),
  submissionDoc: resolve(REPO_ROOT, "docs/marketplace-submission.md"),
  versionFile: resolve(REPO_ROOT, "VERSION"),
};

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

const OPTIONAL_PACK_DOT_MCP = resolve(REPO_ROOT, ".mcp.json");

function withTempHomeAndCwd(fn) {
  const home = mkdtempSync(join(tmpdir(), "usectx-home-"));
  const cwd = mkdtempSync(join(tmpdir(), "usectx-cwd-"));
  try {
    return fn(home, cwd);
  } finally {
    rmSync(home, { recursive: true, force: true });
    rmSync(cwd, { recursive: true, force: true });
  }
}

function writeWorkspaceToken(dir, relativePath, token) {
  const tokenPath = join(dir, relativePath);
  mkdirSync(dirname(tokenPath), { recursive: true });
  writeFileSync(tokenPath, `${token}\n`, { encoding: "utf8" });
  return tokenPath;
}

function collectStrings(value, acc = []) {
  if (typeof value === "string") {
    acc.push(value);
    return acc;
  }
  if (Array.isArray(value)) {
    for (const item of value) collectStrings(item, acc);
    return acc;
  }
  if (value && typeof value === "object") {
    for (const item of Object.values(value)) collectStrings(item, acc);
  }
  return acc;
}

test("kit VERSION stays 0.4.2", () => {
  assert.equal(readFileSync(MANIFEST_PATHS.versionFile, "utf8").trim(), KIT_VERSION);
});

test("marketplace manifests exist and parse as JSON", () => {
  for (const [label, path] of Object.entries(MANIFEST_PATHS)) {
    assert.equal(existsSync(path), true, `${label} must exist at ${path}`);
    if (path.endsWith(".json")) {
      const parsed = readJson(path);
      assert.equal(typeof parsed, "object");
      assert.notEqual(parsed, null);
    }
  }
});

test("plugin manifests stay aligned at kit 0.4.2 and name usectx", () => {
  const agent = readJson(MANIFEST_PATHS.agentPlugin);
  const cursor = readJson(MANIFEST_PATHS.cursorPlugin);
  const grok = readJson(MANIFEST_PATHS.grokPlugin);
  const claude = readJson(MANIFEST_PATHS.claudePlugin);

  assert.equal(agent.$schema, "https://agent-plugins.org/schemas/1.0.0/plugin.schema.json");
  assert.equal(agent.name, "usectx");
  assert.equal(agent.version, KIT_VERSION);
  assert.equal(cursor.name, "usectx");
  assert.equal(cursor.version, KIT_VERSION);
  assert.equal(grok.name, "usectx");
  assert.equal(grok.version, KIT_VERSION);
  assert.equal(claude.name, "usectx");
  assert.equal(claude.version, KIT_VERSION);
});

test("Cursor Plugin points at Host-grant MCP and declares OP0MT_TOKEN only", () => {
  const cursor = readJson(MANIFEST_PATHS.cursorPlugin);
  const mcp = readJson(MANIFEST_PATHS.cursorMcp);

  assert.equal(cursor.hooks, "./hooks/hooks.json");
  assert.equal(cursor.skills, "./skills/");
  assert.equal(cursor.mcpServers, "./.cursor-plugin/mcp.json");
  assert.deepEqual(cursor.variables.required, ["OP0MT_TOKEN"]);
  assert.equal(typeof cursor.variables.properties.OP0MT_TOKEN, "object");

  const auth = mcp.mcpServers.usectx.headers.Authorization;
  assert.equal(auth, "Bearer ${OP0MT_TOKEN}");
  assert.equal(auth.includes("CTX_HTTP_TOKEN"), false);
  assert.equal(auth.includes("ctx_ws_"), false);
});

test("pack MCP manifests stay token-free", () => {
  const pack = readJson(MANIFEST_PATHS.packMcp);
  const manifests = { pack };
  if (existsSync(OPTIONAL_PACK_DOT_MCP)) {
    manifests.dotted = readJson(OPTIONAL_PACK_DOT_MCP);
  }
  const blob = JSON.stringify(manifests);
  assert.equal(blob.includes("Authorization"), false);
  assert.equal(blob.includes("CTX_HTTP_TOKEN"), false);
  assert.equal(blob.includes("op0mt_"), false);
  assert.equal(blob.includes("ctx_ws_"), false);
});

test("root .mcp.json is optional; Agent Plugin mcp.json is the required pack file", () => {
  assert.equal(existsSync(MANIFEST_PATHS.packMcp), true);
  const pack = readJson(MANIFEST_PATHS.packMcp);
  assert.equal(pack.$schema, "https://agent-plugins.org/schemas/1.0.0/mcp.schema.json");
  if (existsSync(OPTIONAL_PACK_DOT_MCP)) {
    const dotted = readJson(OPTIONAL_PACK_DOT_MCP);
    assert.equal(typeof dotted.mcpServers, "object");
    assert.equal(JSON.stringify(dotted).includes("Authorization"), false);
  }
});

test("Grok self-hosted catalog is local and brand-scoped", () => {
  const market = readJson(MANIFEST_PATHS.grokMarketplace);
  assert.equal(market.name, "usectx");
  assert.equal(market.plugins.length, 1);
  const plugin = market.plugins[0];
  assert.equal(plugin.name, "usectx");
  assert.deepEqual(plugin.source, { type: "local", path: "." });
  assert.deepEqual(plugin.keywords, ["usectx", "op0", "ctx.op0.ai"]);
  assert.ok(plugin.domains.includes("ctx.op0.ai"));
});

test("xAI official entry template is remote and SHA-placeholder", () => {
  const entry = readJson(MANIFEST_PATHS.xaiEntry);
  assert.equal(entry.name, "usectx");
  assert.equal(entry.source.source, "url");
  assert.equal(entry.source.url, "https://github.com/op0ai/usectx.git");
  assert.equal(entry.source.sha, "REPLACE_WITH_40_CHAR_COMMIT_SHA");
  assert.equal(entry.source.sha.length === 40 && /^[0-9a-f]+$/.test(entry.source.sha), false);
  assert.deepEqual(entry.keywords, ["usectx", "op0", "ctx.op0.ai"]);
});

test("marketplace manifests never embed workspace bearers or live secrets", () => {
  const paths = [
    MANIFEST_PATHS.agentPlugin,
    MANIFEST_PATHS.cursorPlugin,
    MANIFEST_PATHS.cursorMcp,
    MANIFEST_PATHS.grokPlugin,
    MANIFEST_PATHS.grokMarketplace,
    MANIFEST_PATHS.packMcp,
    MANIFEST_PATHS.xaiEntry,
  ];
  if (existsSync(OPTIONAL_PACK_DOT_MCP)) paths.push(OPTIONAL_PACK_DOT_MCP);
  for (const path of paths) {
    const strings = collectStrings(readJson(path));
    for (const value of strings) {
      assert.equal(
        /ctx_ws_[A-Za-z0-9._-]{8,}/.test(value),
        false,
        `${path} must not embed a workspace bearer token`
      );
      assert.equal(/sk-[A-Za-z0-9]{8,}/.test(value), false, `${path} must not embed sk- secrets`);
      assert.equal(/ghp_[A-Za-z0-9]{8,}/.test(value), false, `${path} must not embed ghp_ secrets`);
    }
  }
});

test("submission doc names Cursor publish, Grok commands, and cursor.directory", () => {
  const doc = readFileSync(MANIFEST_PATHS.submissionDoc, "utf8");
  assert.ok(doc.includes("https://cursor.com/marketplace/publish"));
  assert.ok(doc.includes("python3 scripts/generate-plugin-index.py"));
  assert.ok(doc.includes("python3 scripts/validate-catalog.py"));
  assert.ok(doc.includes("https://cursor.directory/plugins/new"));
  assert.ok(doc.includes("REPLACE_WITH_40_CHAR_COMMIT_SHA"));
  assert.ok(doc.includes("Host-issued `op0mt_` grant"));
  assert.ok(!/\busectx agent\b/.test(doc) || doc.includes("does **not** ship `usectx agent`"));
});

test("README marketplace section requires Host op0mt_ grants", () => {
  const readme = readFileSync(resolve(REPO_ROOT, "README.md"), "utf8");
  assert.ok(readme.includes("## Marketplace install"));
  assert.ok(readme.includes("Host `op0mt_` grants are required"));
  assert.ok(readme.includes("Never"));
  assert.ok(readme.includes("workspace bearer"));
  assert.ok(readme.includes("does **not** ship `usectx agent`"));
});

test("bearer resolver prefers CTX_* then saved workspace login over OP0MT_TOKEN", () => {
  withTempHomeAndCwd((home, cwd) => {
    const isolated = resolveCtxCliBearer({ HOME: home }, cwd);
    assert.equal(isolated.token, undefined);

    const fromGrant = resolveCtxCliBearer({ HOME: home, OP0MT_TOKEN: "op0mt_marketplace_grant" }, cwd);
    assert.equal(fromGrant.token, "op0mt_marketplace_grant");
    assert.equal(fromGrant.source, "OP0MT_TOKEN");

    const ctxWins = resolveCtxCliBearer(
      { HOME: home, CTX_HTTP_TOKEN: "ctx_ws_human", OP0MT_TOKEN: "op0mt_marketplace_grant" },
      cwd
    );
    assert.equal(ctxWins.token, "ctx_ws_human");
    assert.equal(ctxWins.source, "CTX_HTTP_TOKEN");

    writeWorkspaceToken(home, ".op0/usectx/token", "ctx_ws_saved_home");
    const homeWins = resolveCtxCliBearer({ HOME: home, OP0MT_TOKEN: "op0mt_marketplace_grant" }, cwd);
    assert.equal(homeWins.token, "ctx_ws_saved_home");
    assert.equal(homeWins.source, "home");

    writeWorkspaceToken(cwd, "usectx/token", "ctx_ws_saved_project");
    const projectWins = resolveCtxCliBearer({ HOME: home, OP0MT_TOKEN: "op0mt_marketplace_grant" }, cwd);
    assert.equal(projectWins.token, "ctx_ws_saved_project");
    assert.equal(projectWins.source, "project");

    const applied = applyResolvedBearerToEnv(
      { HOME: home, OP0MT_TOKEN: "op0mt_marketplace_grant" },
      cwd
    );
    assert.equal(applied.token, "ctx_ws_saved_project");
    assert.equal(applied.source, "project");
  });
});

test("hooks allow Host OP0MT_TOKEN without CTX_HTTP_TOKEN", () => {
  withTempHomeAndCwd((home, cwd) => {
    const env = { OP0MT_TOKEN: "op0mt_marketplace_grant", HOME: home };
    const start = handleSessionStart({}, env, cwd);
    assert.equal(start.permission, "allow");

    const allowed = handleBeforeMCPExecution({ tool_name: "agent_identity" }, env, cwd);
    assert.equal(allowed.permission, "allow");

    const denied = handleBeforeMCPExecution({ tool_name: "search" }, env, cwd);
    assert.equal(denied.permission, "deny");
  });
});

test("hooks prefer saved workspace login over OP0MT_TOKEN so search stays allowed", () => {
  withTempHomeAndCwd((home, cwd) => {
    writeWorkspaceToken(home, ".op0/usectx/token", "ctx_ws_saved_home");
    const env = { OP0MT_TOKEN: "op0mt_marketplace_grant", HOME: home };
    const search = handleBeforeMCPExecution({ tool_name: "search" }, env, cwd);
    assert.equal(search.permission, "allow");
    assert.equal(search.continue, true);
  });
});
