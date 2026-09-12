import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { resolve } from "node:path";

export const DEFAULT_CTX_URL = "https://ctx.op0.ai";
export const CTX_TOKEN_PREFIX = "ctx_ws_";

export function normalizeCtxEnvToken(value) {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function resolveStoredTokenPath(env = process.env) {
  const home = env.HOME ?? homedir();
  return resolve(home, ".op0", "usectx", "token");
}

export function resolveStoredSessionPath(env = process.env) {
  const home = env.HOME ?? homedir();
  return resolve(home, ".op0", "usectx", "session.json");
}

export function resolveProjectTokenPath(cwd) {
  return resolve(cwd, "usectx", "token");
}

export function resolveProjectTokenCandidates(cwd) {
  return [resolveProjectTokenPath(cwd), resolve(cwd, ".op0", "usectx", "token")];
}

function readTokenFile(path) {
  if (!existsSync(path)) return undefined;
  try {
    return normalizeCtxEnvToken(readFileSync(path, "utf8"));
  } catch {
    return undefined;
  }
}

/**
 * Workspace CLI / hooks / stdio: explicit CTX_* env, then saved project/home
 * login, then OP0MT_TOKEN only as a Host-grant fallback.
 *
 * Marketplace MCP Authorization stays `${OP0MT_TOKEN}` and must never embed a
 * workspace bearer. A present Host grant must not shadow usectx login for
 * ask / search / stdio.
 */
export function resolveCtxCliBearer(env = process.env, cwd = process.cwd()) {
  const homeTokenPath = resolveStoredTokenPath(env);
  const projectTokenPath = resolveProjectTokenPath(cwd);
  const paths = { tokenPath: homeTokenPath, homeTokenPath, projectTokenPath };

  const fromHttp = normalizeCtxEnvToken(env.CTX_HTTP_TOKEN);
  if (fromHttp !== undefined) {
    return { token: fromHttp, source: "CTX_HTTP_TOKEN", ...paths };
  }
  const fromCore = normalizeCtxEnvToken(env.CORE_CTX_TOKEN);
  if (fromCore !== undefined) {
    return { token: fromCore, source: "CORE_CTX_TOKEN", ...paths };
  }
  const fromAlias = normalizeCtxEnvToken(env.CTX_TOKEN);
  if (fromAlias !== undefined) {
    return { token: fromAlias, source: "CTX_TOKEN", ...paths };
  }

  for (const candidate of resolveProjectTokenCandidates(cwd)) {
    if (candidate === homeTokenPath) continue;
    const project = readTokenFile(candidate);
    if (project !== undefined) {
      return { token: project, source: "project", tokenPath: candidate, homeTokenPath, projectTokenPath };
    }
  }
  const home = readTokenFile(homeTokenPath);
  if (home !== undefined) {
    return { token: home, source: "home", ...paths };
  }

  const fromHostGrant = normalizeCtxEnvToken(env.OP0MT_TOKEN);
  if (fromHostGrant !== undefined) {
    return { token: fromHostGrant, source: "OP0MT_TOKEN", ...paths };
  }
  return paths;
}

export function applyResolvedBearerToEnv(env = process.env, cwd = process.cwd()) {
  const bearer = resolveCtxCliBearer(env, cwd);
  if (bearer.token !== undefined && normalizeCtxEnvToken(env.CTX_HTTP_TOKEN) === undefined) {
    env.CTX_HTTP_TOKEN = bearer.token;
  }
  return bearer;
}

export function inspectCtxWsClaims(token) {
  if (typeof token !== "string" || !token.startsWith(CTX_TOKEN_PREFIX)) return undefined;
  const raw = token.slice(CTX_TOKEN_PREFIX.length);
  const dot = raw.indexOf(".");
  if (dot === -1) return undefined;
  try {
    const payloadB64 = raw.slice(0, dot).replaceAll("-", "+").replaceAll("_", "/");
    const pad = "=".repeat((4 - (payloadB64.length % 4)) % 4);
    const payload = JSON.parse(Buffer.from(payloadB64 + pad, "base64").toString("utf8"));
    if (payload.v !== 1 || typeof payload.ws !== "string" || typeof payload.exp !== "number") {
      return undefined;
    }
    return {
      workspaceId: payload.ws,
      expiresAt: new Date(payload.exp).toISOString(),
      expiresAtMs: payload.exp,
      ...(typeof payload.sub === "string" && payload.sub.length > 0 ? { principalId: payload.sub } : {}),
    };
  } catch {
    return undefined;
  }
}

export function readStoredSessionMeta(env = process.env) {
  const sessionPath = resolveStoredSessionPath(env);
  if (!existsSync(sessionPath)) return {};
  try {
    const parsed = JSON.parse(readFileSync(sessionPath, "utf8"));
    const email = typeof parsed.email === "string" ? parsed.email.trim() : "";
    const workspaceId = typeof parsed.workspaceId === "string" ? parsed.workspaceId.trim() : "";
    return {
      ...(email.length > 0 ? { email } : {}),
      ...(workspaceId.length > 0 ? { workspaceId } : {}),
    };
  } catch {
    return {};
  }
}

export function resolveCtxOrigin(env = process.env) {
  const raw = env.CTX_URL ?? env.CORE_CTX_URL ?? DEFAULT_CTX_URL;
  try {
    return new URL(raw).origin;
  } catch {
    return DEFAULT_CTX_URL;
  }
}

export function formatWhoami(result) {
  const lines = [
    "usectx whoami",
    `origin      ${result.origin}`,
    `token       ${result.tokenPresent ? "present" : "absent"}`,
    `token path  ${result.tokenPath}`,
  ];
  if (result.source) lines.push(`source      ${result.source}`);
  if (result.workspaceId) lines.push(`workspace   ${result.workspaceId}`);
  if (result.principalId) lines.push(`principal   ${result.principalId}`);
  if (result.email) lines.push(`email       ${result.email}`);
  if (result.expiresAt) lines.push(`expires     ${result.expiresAt}`);
  if (!result.tokenPresent) lines.push("Run `usectx login` to mint a workspace bearer.");
  return `${lines.join("\n")}\n`;
}

export function inspectWhoami(env = process.env, cwd = process.cwd()) {
  const bearer = applyResolvedBearerToEnv(env, cwd);
  const origin = resolveCtxOrigin({ ...env, CTX_URL: env.CTX_URL ?? env.CORE_CTX_URL ?? DEFAULT_CTX_URL });
  const session = readStoredSessionMeta(env);
  const claims = bearer.token ? inspectCtxWsClaims(bearer.token) : undefined;
  return {
    origin,
    tokenPath: bearer.tokenPath,
    tokenPresent: bearer.token !== undefined,
    ...(bearer.source ? { source: bearer.source } : {}),
    ...((claims?.workspaceId ?? session.workspaceId)
      ? { workspaceId: claims?.workspaceId ?? session.workspaceId }
      : {}),
    ...(claims?.principalId ? { principalId: claims.principalId } : {}),
    ...(session.email ? { email: session.email } : {}),
    ...(claims?.expiresAt ? { expiresAt: claims.expiresAt } : {}),
  };
}
