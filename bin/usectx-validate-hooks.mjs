#!/usr/bin/env node

/**
 * usectx-validate-hooks.mjs — gate for kit 0.4.2 hook config.
 *
 * Enforces:
 * 1. hooks.json exists, is valid JSON, and has numeric version >= 1
 * 2. hooks object is present and non-empty
 * 3. Required security hooks exist: sessionStart, beforeSubmitPrompt,
 *    beforeMCPExecution, sessionEnd
 * 4. Every handler has a non-empty string `command` ("Empty hook is not allowed")
 * 5. beforeSubmitPrompt and beforeMCPExecution set failClosed: true
 * 6. Referenced hook scripts exist on disk
 */

import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import process from "node:process";

export const REQUIRED_HOOK_EVENTS = Object.freeze([
  "sessionStart",
  "beforeSubmitPrompt",
  "beforeMCPExecution",
  "sessionEnd",
]);

export const FAIL_CLOSED_EVENTS = Object.freeze([
  "beforeSubmitPrompt",
  "beforeMCPExecution",
]);

export function resolveCommandScript(command) {
  if (typeof command !== "string") return null;
  const parts = command.trim().split(/\s+/);
  if (parts.length === 0) return null;
  const first = parts[0];
  if (first === "node" || first === "nodejs") {
    return parts[1] ?? null;
  }
  if (first.startsWith("./") || first.startsWith("../") || first.startsWith("hooks/")) {
    return first;
  }
  return null;
}

export function validateHooksConfig(hooksConfig, baseDir = process.cwd()) {
  const errors = [];

  if (!hooksConfig || typeof hooksConfig !== "object" || Array.isArray(hooksConfig)) {
    return {
      valid: false,
      errors: ["hooks.json must be a valid JSON object"],
    };
  }

  if (typeof hooksConfig.version !== "number") {
    errors.push("hooks.json must contain a numeric 'version' field");
  } else if (hooksConfig.version < 1) {
    errors.push("hooks.json version must be >= 1");
  }

  if (!hooksConfig.hooks || typeof hooksConfig.hooks !== "object" || Array.isArray(hooksConfig.hooks)) {
    errors.push("hooks.json must contain a 'hooks' object");
    return { valid: false, errors };
  }

  const hookEvents = Object.keys(hooksConfig.hooks);
  if (hookEvents.length === 0) {
    errors.push("hooks.json 'hooks' object must not be empty");
  }

  for (const requiredEvent of REQUIRED_HOOK_EVENTS) {
    if (!hooksConfig.hooks[requiredEvent]) {
      errors.push(`Missing required security hook: '${requiredEvent}'`);
    }
  }

  for (const [event, handlers] of Object.entries(hooksConfig.hooks)) {
    if (!Array.isArray(handlers)) {
      errors.push(`Hook event '${event}' must be an array of handler objects`);
      continue;
    }

    if (handlers.length === 0) {
      errors.push(`Empty hook is not allowed: '${event}' array is empty`);
      continue;
    }

    const requireFailClosed = FAIL_CLOSED_EVENTS.includes(event);
    let sawFailClosed = false;

    for (let i = 0; i < handlers.length; i++) {
      const handler = handlers[i];
      if (!handler || typeof handler !== "object") {
        errors.push(`Empty hook is not allowed: handler at '${event}[${i}]' is not an object`);
        continue;
      }

      if (typeof handler.command !== "string" || handler.command.trim().length === 0) {
        errors.push(
          `Empty hook is not allowed: handler at '${event}[${i}]' missing non-empty 'command'`
        );
        continue;
      }

      if (handler.failClosed === true) {
        sawFailClosed = true;
      }

      const possibleScript = resolveCommandScript(handler.command);
      if (possibleScript) {
        const resolvedScript = resolve(baseDir, possibleScript);
        if (!existsSync(resolvedScript)) {
          errors.push(
            `Hook script not found: '${possibleScript}' referenced in '${event}[${i}]' does not exist at ${resolvedScript}`
          );
        }
      }
    }

    if (requireFailClosed && !sawFailClosed) {
      errors.push(
        `Security hook '${event}' must set failClosed: true (fail-open is not allowed)`
      );
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function packRootForHooksFile(filePath) {
  const dir = dirname(resolve(filePath));
  return dir.split(/[/\\]/).pop() === "hooks" ? resolve(dir, "..") : dir;
}

export function validateHooksFile(filePath, baseDir) {
  const resolvedPath = resolve(filePath);
  const targetDir = baseDir ?? packRootForHooksFile(resolvedPath);

  if (!existsSync(resolvedPath)) {
    return {
      valid: false,
      errors: [`hooks file not found at ${resolvedPath}`],
    };
  }

  let content;
  try {
    content = readFileSync(resolvedPath, "utf8");
  } catch (err) {
    return {
      valid: false,
      errors: [`Failed to read ${resolvedPath}: ${err.message}`],
    };
  }

  let parsed;
  try {
    parsed = JSON.parse(content);
  } catch (err) {
    return {
      valid: false,
      errors: [`Invalid JSON in ${resolvedPath}: ${err.message}`],
    };
  }

  return validateHooksConfig(parsed, targetDir);
}

export function defaultHooksPath(cwd = process.cwd()) {
  const nested = resolve(cwd, "hooks", "hooks.json");
  if (existsSync(nested)) return nested;
  return resolve(cwd, "hooks.json");
}

export function main() {
  const fileArg = process.argv[2] || defaultHooksPath(process.cwd());
  const result = validateHooksFile(fileArg);

  if (!result.valid) {
    process.stderr.write(`validate-hooks FAILED:\n`);
    for (const err of result.errors) {
      process.stderr.write(`  - ${err}\n`);
    }
    process.exit(1);
  }

  process.stdout.write(`✓ validate-hooks: ${fileArg} is valid and all hooks are non-empty.\n`);
  process.exit(0);
}

if (import.meta.main || (process.argv[1] && process.argv[1].endsWith("usectx-validate-hooks.mjs"))) {
  main();
}
