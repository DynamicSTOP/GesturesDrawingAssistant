import express from "express";
import http from "http";
import path from "path";

import type { GestureApp } from "../gestureApp";
import { isLocalhost } from "../helpers";
import { appInfo } from "./api/appInfo";

export const createHttpServer = async ({ httpPort, wsPort, host, gestureApp }: { httpPort: number, wsPort: number, host: string, gestureApp: GestureApp }): Promise<void> => {
  const app = express();

  const isDev = process.env.VITE_DEV_SERVER_URL !== undefined;

  if (isDev) {
    app.use((_, res, next) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      next();
    });
  }

  // Serve React app static files under /app
  const rendererPath = path.join(__dirname, "..", '..', "..", "renderer");
  app.use("/app", express.static(rendererPath));

  app.get("/app/info", (_req, res) => {

    const isPrivileged = isLocalhost(_req.socket.remoteAddress, host);

    res.json(appInfo({ serverProps: { httpPort, wsPort, host }, isPrivileged, gestureApp }));
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

  return new Promise<void>((resolve) => {
    httpServer.listen(httpPort, '0.0.0.0', () => {
      console.log(`HTTP server listening on 0.0.0.0:${httpPort}`);
      resolve();
    });
  })
}