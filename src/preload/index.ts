// Preload script — runs in the renderer process with access to Node.js APIs.
// Currently minimal; extend with contextBridge.exposeInMainWorld() as needed.

import { contextBridge } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
  platform: process.platform,
});
