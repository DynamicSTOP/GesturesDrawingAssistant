import type Database from "better-sqlite3";
import express from "express";
import http from "http";
import path from "path";
import type { RawData } from "ws";
import { WebSocketServer } from "ws";

import { getSetting } from "./database";

function parseMessage(raw: RawData): string {
  if (Buffer.isBuffer(raw)) {
    return raw.toString("utf8");
  }
  if (raw instanceof ArrayBuffer) {
    return Buffer.from(raw).toString("utf8");
  }
  // Buffer[]
  return Buffer.concat(raw).toString("utf8");
}


export async function startServer({ db, httpPort, wsPort, host }: {
  db: Database.Database, httpPort: number, wsPort: number, host: string
}): Promise<void> {
  const app = express();

  // Serve React app static files under /app
  const rendererPath = path.join(__dirname, "..", "..", "renderer");
  app.use("/app", express.static(rendererPath));

  app.get("/app/info", (_req, res) => {
    res.json({
      httpPort,
      wsPort,
      host,
      cwd: process.cwd()
    });
  });

  // SPA fallback: any /app/* route serves index.html
  app.get("/app/*", (_req, res) => {
    res.sendFile(path.join(rendererPath, "index.html"));
  });

  // Reserved route for future local file serving
  app.get("/static/:uuid/*", (_req, res) => {
    res.status(404).json({ error: "Not implemented yet" });
  });

  const httpServer = http.createServer(app);

  const wss = new WebSocketServer({ host: '0.0.0.0', port: wsPort });

  wss.on("connection", (ws) => {
    ws.on("message", (raw) => {
      try {
        const message = JSON.parse(parseMessage(raw)) as { type: string };

        if (message.type === "appInfo") {
          const localStartTime = getSetting(db, "local_start_time");

          ws.send(
            JSON.stringify({
              type: "appInfo",
              data: {
                httpPort,
                wsPort,
                host,
                cwd: process.cwd(),
                localStartTime: localStartTime ?? null,
              },
            })
          );
        }
      } catch {
        // Ignore malformed messages
      }
    });
  });

  await Promise.all([
    new Promise<void>((resolve) => {
      httpServer.listen(httpPort, '0.0.0.0', () => {
        console.log(`HTTP server listening on ${host}:${httpPort}`);
        resolve();
      });
    }),
    new Promise<void>((resolve) => {
      wss.on("listening", () => {
        console.log(`WebSocket server listening on ${host}:${wsPort}`);
        resolve();
      });
    }),
  ]);
}
