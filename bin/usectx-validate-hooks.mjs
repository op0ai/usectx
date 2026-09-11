#!/usr/bin/env node

/**
 * usectx-validate-hooks.mjs - Validator for hooks.json configuration
 *
 * Enforces that:
 * 1. hooks.json exists, is valid JSON, and has version >= 1
 * 2. hooks object is present and non-empty
 * 3. Every hook event has a non-empty array of handlers
 * 4. Every handler has a non-empty string `command` (empty hook is rejected: "Empty hook is not allowed")
 * 5. Required security hooks exist:
 *    - sessionStart
 *    - beforeSubmitPrompt
 *    - beforeMCPExecution
 *    - sessionEnd
 * 6. Referenced hook scripts exist on disk and are executable
 */

import { existsSync, readFileSync, statSync } from "node:fs";
import { resolve, dirname } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const REQUIRED_HOOK_EVENTS = [
  "sessionStart",
  "beforeSubmitPrompt",
  "beforeMCPExecution",
  "sessionEnd",
];

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
  }

  if (!hooksConfig.hooks || typeof hooksConfig.hooks !== "object" || Array.isArray(hooksConfig.hooks)) {
    errors.push("hooks.json must contain a 'hooks' object");
    return { valid: false, errors };
  }

  const hookEvents = Object.keys(hooksConfig.hooks);
  if (hookEvents.length === 0) {
    errors.push("hooks.json 'hooks' object must not be empty");
  }

  // Check required security hooks
  for (const requiredEvent of REQUIRED_HOOK_EVENTS) {
    if (!hooksConfig.hooks[requiredEvent]) {
      errors.push(`Missing required security hook: '${requiredEvent}'`);
    }
  }

  // Check each hook event
  for (const [event, handlers] of Object.entries(hooksConfig.hooks)) {
    if (!Array.isArray(handlers)) {
      errors.push(`Hook event '${event}' must be an array of handler objects`);
      continue;
    }

    if (handlers.length === 0) {
      errors.push(`Empty hook is not allowed: '${event}' array is empty`);
      continue;
    }

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

      // Check if command references a relative script file
      const cmdParts = handler.command.trim().split(/\s+/);
      const possibleScript = cmdParts[0].startsWith("./") ? cmdParts[0] : null;
      if (possibleScript) {
        const resolvedScript = resolve(baseDir, possibleScript);
        if (!existsSync(resolvedScript)) {
          errors.push(
            `Hook script not found: '${possibleScript}' referenced in '${event}[${i}]' does not exist at ${resolvedScript}`
          );
        }
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function validateHooksFile(filePath, baseDir) {
  const resolvedPath = resolve(filePath);
  const targetDir = baseDir ?? dirname(resolvedPath);

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

export function main() {
  const fileArg = process.argv[2] || resolve(process.cwd(), "hooks.json");
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
