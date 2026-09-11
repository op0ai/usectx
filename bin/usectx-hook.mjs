#!/usr/bin/env node

/**
 * Compatibility entry for kit 0.3.1 paths. Canonical handler is hooks/usectx-hook.mjs.
 */

export * from "../hooks/usectx-hook.mjs";

import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import { main } from "../hooks/usectx-hook.mjs";

const invokedDirectly =
  process.argv[1] !== undefined &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (import.meta.main || invokedDirectly) {
  main();
}
