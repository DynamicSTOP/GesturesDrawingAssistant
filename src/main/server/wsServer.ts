import type { RawData, WebSocket } from "ws";
import { WebSocketServer } from "ws";

import { isLocalhost } from "../../domain/helpers";
import type { AppInfoUpdateMessage, BaseMessage, GestureAppCurrentMediaIdMessage, ListFolderMessage, SetGestureAppStateMessage, SetMediaFolderMessage } from "../../domain/messages";
import { isBaseMessage, isGestureAppSwitchMediaMessage, isListFolderRequestMessage, isSetGestureAppStateMessage, isSetMediaFolderMessage } from "../../domain/messages";
import type { GestureApp } from "../GestureApp";
import { appInfo } from "./api/appInfo";
import { listFolder } from "./api/listFolder";

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

interface WebsocketListenerProps {
  ws: WebSocket;
  isPrivileged: boolean;
  serverProps: CreateWsServerProps;
  gestureApp: GestureApp;
}


// eslint-disable-next-line sonarjs/cognitive-complexity, complexity
const websocketListener = ({ ws, isPrivileged, serverProps, gestureApp }: WebsocketListenerProps) => (raw: RawData) => {
  try {
    const strMessage = parseMessage(raw);
    const message: unknown = JSON.parse(strMessage);

    if (!isBaseMessage(message)) {
      console.warn(`Invalid message: ${typeof message}`, message);
      return;
    }

    const type = message.type;
    console.log(`Received message: ${type}`);
    const send = (data: BaseMessage['data']) => {
      ws.send(JSON.stringify({ type, data }));
    }
    const sendRaw = (data: BaseMessage) => {
      ws.send(JSON.stringify(data));
    }

    if (isPrivileged) {
      // will go through all privileged messages like list files etc
      switch (type) {
        case "getFSDrives": {
          send({ drives: ["C:", "D:", "E:"] });
          return;
        }
        case "listFolderRequest": {
          if (isListFolderRequestMessage(message)) {
            const listFolderMessage: ListFolderMessage = {
              type: "listFolder",
              data: listFolder({ folderPath: message.data.path ?? process.cwd() }),
            };
            sendRaw(listFolderMessage);
          }
          return;
        }
        case "setMediaFolder": {
          if (isSetMediaFolderMessage(message)) {
            gestureApp.setMediaFolder(message.data.mediaFolder);
            const mediaFolderMessage: SetMediaFolderMessage['data'] = {
              mediaFolder: message.data.mediaFolder,
            };
            send(mediaFolderMessage);
          }
          return;
        }
        case "getCurrentState": {
          send({ state: gestureApp.getState() });
          return;
        }
        case "setGestureAppState": {
          if (isSetGestureAppStateMessage(message)) {
            const { newGestureAppState, slideShowInterval, greyscale, randomFlip } = message.data;
            gestureApp.setCurrentSlideShowInterval(slideShowInterval);
            gestureApp.setCurrentGreyscale(greyscale);
            gestureApp.setRandomFlip(randomFlip);
            gestureApp.switchState(newGestureAppState);
          }
          return;
        }
        case "gestureAppSwitchMedia": {
          if (isGestureAppSwitchMediaMessage(message)) {
            gestureApp.switchMedia(message.data.forward);
          }
          return;
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
        return;
      }
      case "getCurrentState": {
        send({ state: gestureApp.getState() });
        return;
      }
      default: {
        console.warn(`Unknown message type: ${message.type}`);
      }
    }
  } catch (error) {
    console.error("Error parsing message", error);
    // Ignore malformed messages
  }
};

const connectedClients = new Map<WebSocket, { isPrivileged: boolean }>();

const sendToAllClients = (message: BaseMessage) => {
  const data = JSON.stringify(message)
  Array.from(connectedClients.keys()).forEach((ws) => {
    ws.send(data);
  });
}

const addGestureAppListener = (gestureApp: GestureApp) => {
  gestureApp.addEventListener("changeState", () => {
    const state = gestureApp.getState();
    const message: SetGestureAppStateMessage = {
      type: "setGestureAppState",
      data: { newGestureAppState: state },
    };
    sendToAllClients(message);
  });

  gestureApp.addEventListener("changeCurrentMediaId", () => {
    const currentMediaId = gestureApp.getCurrentMediaId();
    const message: GestureAppCurrentMediaIdMessage = {
      type: "gestureAppCurrentMediaId",
      data: {
        currentMediaId,
        flipped: gestureApp.isMediaIdFlipped(currentMediaId)
      },
    };
    sendToAllClients(message);
  });

  const sendAppInfoUpdate = () => {
    const appInfoMessage: AppInfoUpdateMessage = {
      type: "appInfoUpdate",
      data: {
        mediaFolder: gestureApp.getMediaFolder(),
        currentSlideShowInterval: gestureApp.getCurrentSlideShowInterval(),
        greyscale: gestureApp.getCurrentGreyscale(),
        randomFlip: gestureApp.getRandomFlip(),
      },
    };
    sendToAllClients(appInfoMessage);
  }

  gestureApp.addEventListener("changeCurrentSlideShowInterval", sendAppInfoUpdate);
  gestureApp.addEventListener("changeCurrentGreyscale", sendAppInfoUpdate);
  gestureApp.addEventListener("changeMediaFolder", sendAppInfoUpdate);
  gestureApp.addEventListener("changeRandomFlip", sendAppInfoUpdate);
}


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

  addGestureAppListener(gestureApp);

  return new Promise<void>((resolve) => {
    wss.on("listening", () => {
      console.log(`WebSocket server listening on 0.0.0.0:${wsPort}`);
      resolve();
    });
  });
}