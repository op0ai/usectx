---
name: usectx-code-graph
description: Hop the code graph when walking callers, callees, or symbol structure instead of grepping.
---

# Hop

`code_graph` walks extracted structure. Grep is text. Hop when the question is "what calls this" or "what does this depend on".

If MCP `code_graph` is missing and `usectx` is not on PATH, **attach** first — [`../usectx-attach/SKILL.md`](../usectx-attach/SKILL.md). Do not login here.

## 1. Pick the symbol

Use the identifier as written in source (`codeGraphRetrieveWide`, not a sentence).

**Done when:** one symbol is chosen, or hop is skipped because the question is lexical (then **lease** via `usectx-retrieve`).

## 2. Walk

MCP tool `code_graph` with `{ "symbol": "<id>", "depth": 2, "direction": "any" }`.

Directions: `in` callers, `out` callees, `any` both.

**Done when:** edges return, or `ROOTS` lists that the symbol is not indexed (then **extract**).

## 3. Stay on the graph

Do not paste a repo-wide grep as a graph walk. If the index is empty, stop and extract.

**Done when:** the answer is edges plus symbols, or an honest `ROOTS` miss.
