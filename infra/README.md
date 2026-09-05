# Local pgctx stack (Evokoa)

Pinned image: **`ghcr.io/evokoa/pggraph:1.2.0`**

## Gap: pgcontext 0.3.0

This compose brings up **pggraph only**. Hybrid RRF requires **pgcontext 0.3.0**,
which is **not** bundled here yet. Until it is:

- Retrieval mode is **degraded lexical** on pggraph.
- `bun run ctx:doctor` / `GET /readyz` must report that honestly.

When Evokoa publishes a pgcontext-capable image or extension install path for
0.3.0, add it here and flip the doctor posture to hybrid.

## Usage

```bash
docker compose -f infra/compose.pgctx.yaml up -d
docker compose -f infra/compose.pgctx.yaml ps
docker compose -f infra/compose.pgctx.yaml down
```

Default Postgres port on host: **5433** (avoids clashing with local 5432).

Connection URL (dev only — no production secrets):

```
postgres://pgctx:pgctx@127.0.0.1:5433/pgctx
```

## Services

| Service | Image | Notes |
| --- | --- | --- |
| `pggraph` | `ghcr.io/evokoa/pggraph:1.2.0` | Graph + lexical substrate |
| pgcontext | — | **TODO 0.3.0** |

Do not commit credentials beyond these local compose defaults.
