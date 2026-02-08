import type { RawData, WebSocket } from "ws";
import { WebSocketServer } from "ws";

import type { BaseMessage } from "../../domain/messages";
import { isBaseMessage } from "../../domain/messages";
import type { GestureApp } from "../gestureApp";
import { isLocalhost } from "../helpers";
import { appInfo } from "./api/appInfo";

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

export interface CreateWsServerProps {
  httpPort: number;
  wsPort: number;
  host: string;
}


const websocketListener = ({ ws, isPrivileged, serverProps, gestureApp }: { ws: WebSocket, isPrivileged: boolean, serverProps: CreateWsServerProps, gestureApp: GestureApp }) => (raw: RawData) => {
  try {
    const strMessage = parseMessage(raw);
    const message: unknown = JSON.parse(strMessage);

    if (!isBaseMessage(message)) {
      console.warn(`Invalid message: ${typeof message}`, message);
      return;
    }

    const type = message.type;
    const send = (data: BaseMessage['data']) => {
      ws.send(JSON.stringify({ type, data }));
    }

    if (isPrivileged) {
      // will go through all privileged messages like list files etc
      switch (type) {
        case "getFSDrives": {
          send({ drives: ["C:", "D:", "E:"] });
          break;
        }
        case "getCurrentState": {
          send({ state: gestureApp.getState() });
          break;
        }
        default: {
          // not a privileged message
          break;
        }
      }
    }

    switch (message.type) {
      case "appInfo": {
        send(appInfo({ serverProps, isPrivileged, gestureApp }));
        break;
      }
      case "getCurrentState": {
        send({ state: gestureApp.getState() });
        break;
      }
      default: {
        console.warn(`Unknown message type: ${message.type}`);
        break;
      }
    }
  } catch {
    // Ignore malformed messages
  }
};

const connectedClients = new Map<WebSocket, { isPrivileged: boolean }>();

export const createWsServer = async (serverProps: { httpPort: number, wsPort: number, host: string, gestureApp: GestureApp }): Promise<void> => {
  const { wsPort, host, gestureApp } = serverProps;
  const wss = new WebSocketServer({ host: '0.0.0.0', port: wsPort });

  wss.on("connection", (ws, req) => {
    const { remoteAddress } = req.socket;
    const isPrivileged = isLocalhost(remoteAddress, host);
    connectedClients.set(ws, { isPrivileged });
    ws.on("message", websocketListener({ ws, isPrivileged, serverProps, gestureApp }));

    ws.on("close", () => {
      connectedClients.delete(ws);
      console.log(`Disconnected client: ${remoteAddress}`, isPrivileged);
      console.log(`Connected clients: ${connectedClients.size}`);
    });

    console.log(`Connected client: ${remoteAddress}`, isPrivileged);
    console.log(`Connected clients: ${connectedClients.size}`);
  });

  return new Promise<void>((resolve) => {
    wss.on("listening", () => {
      console.log(`WebSocket server listening on 0.0.0.0:${wsPort}`);
      resolve();
    });
  });
}