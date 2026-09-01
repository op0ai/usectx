---
name: usectx-retrieve
description: Lease usectx retrieve when searching settled evidence or asking what the workspace already knows.
---

# Lease

Retrieve is a **lease** over settled evidence. It is not a bigger context window.

If MCP `search` is missing and `usectx` is not on PATH, **attach** first — [`../usectx-attach/SKILL.md`](../usectx-attach/SKILL.md). Do not login here.

## 1. Call search

MCP tool `search` with `{ "query": "<question>", "limit": 5 }`. Omit the lease field — the door attaches one from the workspace bearer.

**Done when:** ranked chunks return, or an honest empty result (no invented hits).

## 2. Read the receipt

Every hit carries source, turn, and rank. Turn orders **within one source**. Rank is neither recency nor truth. A later turn on the same source supersedes an earlier claim.

**Done when:** the answer cites the chunks, or says the store has nothing.

## 3. Fail closed

Wrong or missing bearer → refuse, do not widen. Another tenant's corpus is unreachable.

**Done when:** a refused call is reported as refused, not as empty knowledge.

CLI loop: `usectx ask "<question>"` (hop then lease). Nouns and jobs: [`../../HOOKS.md`](../../HOOKS.md).
