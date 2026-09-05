#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import process from "node:process";
import { createInterface } from "node:readline";
import { fileURLToPath } from "node:url";
import { applyResolvedBearerToEnv } from "./usectx-token.mjs";

/**
 * Stdio MCP for Agent Plugins. Each stdin line is one JSON-RPC envelope, posted unchanged
 * to ctx `POST /mcp`. This process holds no tool table. ctx already decided the catalogue.
 *
 * Origin and bearer come from the process environment, never from the envelope.
 * Laptop start overlays unset keys from repo-root `.env.ctx.local`. Hosted start does not.
 */

export const DEFAULT_CTX_URL = "http://127.0.0.1:4790";
export const MCP_JSONRPC_LIMIT = 1024 * 1024;
const CTX_LOCAL_ENV_FILE = ".env.ctx.local";
const COMPOSE_MARKER = "infra/compose.pgctx.yaml";

export function isHostedEnvironment(env) {
  if (env.NODE_ENV === "production") return true;
  if (
    env.CORE_STAGE !== undefined &&
    !env.CORE_STAGE.startsWith("dev_") &&
    !env.CORE_STAGE.startsWith("local") &&
    !env.CORE_STAGE.startsWith("scratch-")
  ) {
    return true;
  }
  if (env.CF_WORKER === "true" || env.WORKERS_ENV === "production") return true;
  if (env.CTX_ENV === "hosted" || env.CTX_ENV === "production") return true;
  return false;
}

export function shouldLoadCtxLocalEnv(env) {
  return !isHostedEnvironment(env);
}

export function findWorkspaceRoot(startDir) {
  let current = resolve(startDir);
  while (true) {
    if (existsSync(resolve(current, COMPOSE_MARKER))) {
      return current;
    }
    const parent = dirname(current);
    if (parent === current) {
      return resolve(startDir);
    }
    current = parent;
  }
}

export function unquoteEnvValue(raw) {
  const trimmed = raw.trim();
  if (trimmed.startsWith("'") && trimmed.endsWith("'") && trimmed.length >= 2) {
    return trimmed.slice(1, -1).replaceAll("'\\''", "'");
  }
  if (trimmed.startsWith('"') && trimmed.endsWith('"') && trimmed.length >= 2) {
    try {
      return JSON.parse(trimmed);
    } catch {
      return trimmed.slice(1, -1);
    }
  }
  return trimmed;
}

export function parseEnvFile(contents) {
  const result = {};
  for (const line of contents.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (trimmed.length === 0 || trimmed.startsWith("#")) {
      continue;
    }
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) {
      continue;
    }
    const key = trimmed.slice(0, eqIdx).trim();
    const rawVal = trimmed.slice(eqIdx + 1);
    if (key.length > 0) {
      result[key] = unquoteEnvValue(rawVal);
    }
  }
  return result;
}

export function loadCtxLocalEnv(repoRoot, env, envFileName = CTX_LOCAL_ENV_FILE) {
  const envFilePath = resolve(repoRoot, envFileName);
  if (!existsSync(envFilePath)) {
    return env;
  }
  const parsed = parseEnvFile(readFileSync(envFilePath, "utf8"));
  for (const [key, value] of Object.entries(parsed)) {
    const existing = env[key];
    if (existing === undefined || existing.trim() === "") {
      env[key] = value;
    }
  }
  return env;
}

export function resolveRepoRoot(scriptDir, cwd = process.cwd()) {
  const fromScript = findWorkspaceRoot(scriptDir);
  if (existsSync(resolve(fromScript, COMPOSE_MARKER))) {
    return fromScript;
  }
  return findWorkspaceRoot(cwd);
}

/** Overlay `.env.ctx.local` onto unset keys. Hosted process env is left untouched. */
export function applyCtxLocalEnv(env, repoRoot) {
  if (!shouldLoadCtxLocalEnv(env)) {
    return env;
  }
  return loadCtxLocalEnv(repoRoot, env);
}

export const isLoopbackHost = (hostname) => {
  if (hostname === "localhost" || hostname === "::1" || hostname === "[::1]") return true;
  return /^127(?:\.\d{1,3}){3}$/u.test(hostname);
};

function normalizeEnvValue(value) {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length === 0 ? undefined : trimmed;
}

export function resolveAccessPair(env) {
  const clientId = normalizeEnvValue(env.CORE_CTX_ACCESS_CLIENT_ID);
  const clientSecret = normalizeEnvValue(env.CORE_CTX_ACCESS_CLIENT_SECRET);
  if (clientId === undefined && clientSecret === undefined) {
    return { ok: true, access: undefined };
  }
  if (clientId !== undefined && clientSecret !== undefined) {
    return { ok: true, access: { clientId, clientSecret } };
  }
  return {
    ok: false,
    error:
      "CORE_CTX_ACCESS_* is half-bound. Set both CORE_CTX_ACCESS_CLIENT_ID and CORE_CTX_ACCESS_CLIENT_SECRET or neither.",
  };
}

export function accessHeaders(env, url) {
  const pair = resolveAccessPair(env);
  if (!pair.ok) {
    throw new Error(pair.error);
  }
  if (pair.access === undefined) {
    return {};
  }
  let parsedUrl;
  try {
    parsedUrl = url instanceof URL ? url : new URL(url);
  } catch {
    return {};
  }
  if (isLoopbackHost(parsedUrl.hostname)) {
    return {};
  }
  return {
    "CF-Access-Client-Id": pair.access.clientId,
    "CF-Access-Client-Secret": pair.access.clientSecret,
  };
}

export function resolveShimConfig(env) {
  const bearer = applyResolvedBearerToEnv(env);
  const token = bearer.token;
  if (typeof token !== "string" || token.trim().length === 0) {
    return { ok: false, error: "Run 'usectx login' or set CTX_HTTP_TOKEN" };
  }

  const raw = env.CTX_URL ?? env.CORE_CTX_URL ?? DEFAULT_CTX_URL;
  let url;
  try {
    url = new URL(raw);
  } catch {
    return { ok: false, error: "CTX_URL is not a URL" };
  }

  const loopback = isLoopbackHost(url.hostname);
  if (url.protocol !== "https:" && !(url.protocol === "http:" && loopback)) {
    return { ok: false, error: "CTX_URL must be https, or http on loopback" };
  }
  if (url.username !== "" || url.password !== "" || url.hash !== "" || url.search !== "") {
    return { ok: false, error: "CTX_URL must not carry userinfo, query, or hash" };
  }

  const path =
    url.pathname === "" || url.pathname === "/" ? "/mcp" : url.pathname.replace(/\/$/u, "");
  if (path !== "/mcp" && path !== "/v1/mcp") {
    return { ok: false, error: "CTX_URL must be an origin or end with /mcp or /v1/mcp" };
  }
  url.pathname = path === "/v1/mcp" ? "/v1/mcp" : "/mcp";

  const access = resolveAccessPair(env);
  if (!access.ok) {
    return { ok: false, error: access.error };
  }

  return {
    ok: true,
    token: token.trim(),
    mcpUrl: url.toString(),
    accessHeaders: accessHeaders(env, url),
  };
}

function parseEnvelope(line) {
  try {
    const value = JSON.parse(line);
    if (value !== null && typeof value === "object" && !Array.isArray(value)) return value;
  } catch {
    return;
  }
}

function jsonRpcError(id, message) {
  return JSON.stringify({
    jsonrpc: "2.0",
    id,
    error: { code: -32600, message },
  });
}

function isNotification(envelope) {
  return envelope !== undefined && !Object.hasOwn(envelope, "id");
}

export function createShim({ fetchImpl, env, writeStdout, writeStderr }) {
  const config = resolveShimConfig(env);
  if (!config.ok) {
    writeStderr(`${config.error}\n`);
    return { ok: false, error: config.error };
  }

  return {
    ok: true,
    async handleLine(line) {
      const oversized = Buffer.byteLength(line, "utf8") > MCP_JSONRPC_LIMIT;
      const envelope = parseEnvelope(line);
      if (oversized) {
        if (!isNotification(envelope)) {
          writeStdout(`${jsonRpcError(envelope?.id ?? null, "JSON-RPC envelope exceeds 1 MiB")}\n`);
        }
        return;
      }
      if (envelope === undefined) {
        writeStdout(`${jsonRpcError(null, "not a JSON-RPC object")}\n`);
        return;
      }
      const notification = isNotification(envelope);
      let response;
      try {
        response = await fetchImpl(config.mcpUrl, {
          method: "POST",
          headers: {
            "content-type": "application/json",
            Authorization: `Bearer ${config.token}`,
            ...config.accessHeaders,
          },
          body: line,
        });
      } catch (cause) {
        if (!notification) {
          const message = cause instanceof Error ? cause.message : "unreachable";
          writeStdout(`${jsonRpcError(envelope.id ?? null, message)}\n`);
        }
        return;
      }
      if (notification) return;
      let body;
      try {
        body = await response.text();
      } catch (cause) {
        const message = cause instanceof Error ? cause.message : "unreachable";
        writeStdout(`${jsonRpcError(envelope.id ?? null, message)}\n`);
        return;
      }
      if (body.length === 0) {
        writeStdout(
          `${jsonRpcError(envelope.id ?? null, `the outlet answered ${String(response.status)}`)}\n`,
        );
        return;
      }
      writeStdout(body.endsWith("\n") ? body : `${body}\n`);
    },
  };
}

export async function runShim({ stdin, stdout, stderr, env, fetchImpl }) {
  const shim = createShim({
    fetchImpl,
    env,
    writeStdout: (chunk) => {
      stdout.write(chunk);
    },
    writeStderr: (chunk) => {
      stderr.write(chunk);
    },
  });
  if (!shim.ok) return 1;
  const lines = createInterface({ input: stdin, crlfDelay: Infinity });
  for await (const line of lines) {
    if (line.length === 0) continue;
    await shim.handleLine(line);
  }
  return 0;
}

function launchedAsMain() {
  const entry = process.argv[1];
  if (entry === undefined) return false;
  return fileURLToPath(import.meta.url) === resolve(entry);
}

if (launchedAsMain()) {
  const scriptDir = dirname(fileURLToPath(import.meta.url));
  const env = applyCtxLocalEnv({ ...process.env }, resolveRepoRoot(scriptDir));
  const code = await runShim({
    stdin: process.stdin,
    stdout: process.stdout,
    stderr: process.stderr,
    env,
    fetchImpl: fetch,
  });
  process.exit(code);
}
