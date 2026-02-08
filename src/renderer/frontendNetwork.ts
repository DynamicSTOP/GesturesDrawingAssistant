import type { ConnectionStatusEventData } from "../domain/customEvents";
import type { AppInfoMessage, BaseMessage } from "../domain/messages";
import { isBaseMessage } from "../domain/messages";

export type ConnectionStatus = "connected" | "disconnected" | "disconnecting" | "error" | "unknown";


export class FrontendNetwork extends EventTarget {
  private ws: WebSocket | null = null;

  private wsUrl: string | null = null;

  constructor() {
    super();
    this.init();
  }

  private init() {
    fetch("/app/info")
      .then(async res => res.json() as Promise<AppInfoMessage['data']>)
      .then((data: AppInfoMessage['data']) => {
        const wsUrl = `ws://${data.host}:${data.wsPort}`;
        this.wsUrl = wsUrl;
        this.connectWebsocket();
      })
      .catch((error: unknown) => {
        console.error(error);
      });
  }


  private static makeEvent<T = unknown>(type: string, detail: T): CustomEvent<T> {
    return new CustomEvent<T>(type, { detail });
  }

  private connectWebsocket() {
    if (this.wsUrl === null) {
      console.error("WebSocket URL is not set");
      return;
    }
    const ws = new WebSocket(this.wsUrl);
    this.ws = ws;

    ws.addEventListener("open", () => {
      this.dispatchEvent(new CustomEvent("connectionStatus", { detail: "Connected" }));
      ws.send(JSON.stringify({ type: "appInfo", data: {} }));
    });

    ws.addEventListener("message", (event) => {
      try {
        const message: unknown = JSON.parse(String(event.data));

        if (!isBaseMessage(message)) {
          console.error("Invalid message", event.data);
          return;
        }
        this.dispatchEvent(FrontendNetwork.makeEvent<BaseMessage>('appMessage', message));
      } catch {
        // Ignore malformed messages
      }
    });

    ws.addEventListener("close", () => {
      this.ws = null;
      this.dispatchEvent(FrontendNetwork.makeEvent<ConnectionStatusEventData>("connectionStatus", { status: "disconnected" }));
    });

    ws.addEventListener("error", (error: unknown) => {
      console.error("WebSocket error", error);
      this.dispatchEvent(FrontendNetwork.makeEvent<ConnectionStatusEventData>("connectionStatus", { status: "error" }));
    });
  }

  getConnectionStatus(): ConnectionStatus {
    if (this.ws === null) {
      return "disconnected";
    }
    switch (this.ws.readyState) {
      case WebSocket.OPEN: {
        return "connected";
      }
      case WebSocket.CLOSING: {
        return "disconnecting";
      }
      case WebSocket.CLOSED: {
        return "disconnected";
      }
    }
    return 'unknown';
  }

  close() {
    if (this.ws === null) {
      console.error("WebSocket is not connected");
      return;
    }
    this.ws.close();
    this.ws = null;
  }
}