import { app, BrowserWindow } from "electron";
import path from "path";

import { initDatabase } from "./database";
import { GestureApp } from "./gestureApp";
import { getLocalIp } from "./network";
import { startServer } from "./server";


const HTTP_PORT = 8080;
const WS_PORT = 8081;

async function createWindow(): Promise<BrowserWindow> {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload", "index.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  await win.loadFile(path.join(__dirname, "..", "..", "..", "loading.html"));

  return win;
}

async function main(): Promise<void> {
  await app.whenReady();

  const mainWindow = await createWindow();

  // Initialize SQLite database (creates file + tables if needed, writes local_start_time)
  const db = initDatabase();
  
  const host = getLocalIp();

  const gestureApp = new GestureApp();

  // Start HTTP and WebSocket servers (waits for both to be listening)
  await startServer({ db, httpPort: HTTP_PORT, wsPort: WS_PORT, host, gestureApp });

  // Redirect to the React app once both servers are ready
  const devServerUrl = process.env.VITE_DEV_SERVER_URL;
  const baseUrl =
    devServerUrl === undefined
      ? `http://localhost:${HTTP_PORT}/app`
      : `${devServerUrl}/app`;

  console.log(`Redirecting to: ${baseUrl}`);
  await mainWindow.loadURL(baseUrl);

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow().catch(console.error);
    }
  });
}

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

main().catch(console.error);
