import type { Server } from "node:http";
import { createServer } from "node:http";
import { stubReadyz } from "../posture.ts";

const DEFAULT_PORT = 4790;

/**
 * Minimal local HTTP door stub: /health, /readyz, POST /mcp.
 * Full Effect-native engine lands when packages/ctx is imported from core.
 */
export function createStubHttpServer(opts?: { port?: number }): {
  port: number;
  start: () => Promise<Server>;
} {
  const port = opts?.port ?? Number(process.env.CTX_HTTP_PORT ?? DEFAULT_PORT);

  return {
    port,
    start: () =>
      new Promise((resolve, reject) => {
        const server = createServer(async (req, res) => {
          const url = new URL(req.url ?? "/", `http://127.0.0.1:${port}`);
          const path = url.pathname;

          if (req.method === "GET" && (path === "/health" || path === "/livez")) {
            res.writeHead(200, { "content-type": "application/json" });
            res.end(JSON.stringify({ ok: true, stub: true, package: "@op0/ctx" }));
            return;
          }

          if (req.method === "GET" && (path === "/readyz" || path === "/ready")) {
            const body = stubReadyz();
            res.writeHead(200, { "content-type": "application/json" });
            res.end(JSON.stringify(body));
            return;
          }

          if (req.method === "POST" && (path === "/mcp" || path === "/v1/mcp")) {
            const chunks: Buffer[] = [];
            for await (const chunk of req) {
              chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
            }
            let id: unknown = null;
            try {
              const envelope = JSON.parse(Buffer.concat(chunks).toString("utf8")) as {
                id?: unknown;
                method?: string;
              };
              id = envelope.id ?? null;
              const method = envelope.method ?? "";

              if (method === "initialize") {
                res.writeHead(200, { "content-type": "application/json" });
                res.end(
                  JSON.stringify({
                    jsonrpc: "2.0",
                    id,
                    result: {
                      protocolVersion: "2024-11-05",
                      capabilities: { tools: {} },
                      serverInfo: { name: "usectx-ctx-stub", version: "0.3.0-dev" },
                    },
                  }),
                );
                return;
              }

              if (method === "tools/list") {
                res.writeHead(200, { "content-type": "application/json" });
                res.end(
                  JSON.stringify({
                    jsonrpc: "2.0",
                    id,
                    result: {
                      tools: [
                        {
                          name: "search",
                          description:
                            "Lease + search settled evidence (stub: import @op0/ctx from core)",
                          inputSchema: {
                            type: "object",
                            properties: { query: { type: "string" }, limit: { type: "number" } },
                            required: ["query"],
                          },
                        },
                        {
                          name: "code_graph",
                          description: "Hop callers/callees via Graphify extract (stub)",
                          inputSchema: {
                            type: "object",
                            properties: {
                              symbol: { type: "string" },
                              depth: { type: "number" },
                              direction: { type: "string" },
                            },
                            required: ["symbol"],
                          },
                        },
                        {
                          name: "health",
                          description: "Engine health / retrieval posture",
                          inputSchema: { type: "object", properties: {} },
                        },
                      ],
                    },
                  }),
                );
                return;
              }

              if (method === "tools/call") {
                const readyz = stubReadyz();
                res.writeHead(200, { "content-type": "application/json" });
                res.end(
                  JSON.stringify({
                    jsonrpc: "2.0",
                    id,
                    result: {
                      content: [
                        {
                          type: "text",
                          text: JSON.stringify(
                            {
                              stub: true,
                              message:
                                "@op0/ctx is a scaffold. Copy packages/ctx from op0ai/core (see scripts/import-from-core.md).",
                              readyz,
                            },
                            null,
                            2,
                          ),
                        },
                      ],
                    },
                  }),
                );
                return;
              }

              res.writeHead(200, { "content-type": "application/json" });
              res.end(
                JSON.stringify({
                  jsonrpc: "2.0",
                  id,
                  error: { code: -32601, message: `Method not found (stub): ${method}` },
                }),
              );
            } catch (err) {
              res.writeHead(200, { "content-type": "application/json" });
              res.end(
                JSON.stringify({
                  jsonrpc: "2.0",
                  id,
                  error: {
                    code: -32700,
                    message: err instanceof Error ? err.message : "parse error",
                  },
                }),
              );
            }
            return;
          }

          res.writeHead(404, { "content-type": "text/plain" });
          res.end("not found\n");
        });

        server.once("error", reject);
        server.listen(port, "127.0.0.1", () => {
          resolve(server);
        });
      }),
  };
}
