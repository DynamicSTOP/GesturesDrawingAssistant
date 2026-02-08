import type { GestureAppState } from "../main/gestureApp";

export interface BaseMessage {
  type: string;
  data: Record<string, unknown>;
}

export const isBaseMessage = (message: unknown): message is BaseMessage => {
  if (message === null || typeof message !== "object") {
    return false;
  }
  const messageObj = message as Record<string, unknown>;
  return "type" in messageObj && typeof messageObj.type === "string" && "data" in messageObj && typeof messageObj.data === "object" && messageObj.data !== null;
}

export interface AppInfoMessage extends BaseMessage {
  type: "appInfo";
  data: {
    isPrivileged: boolean;
    httpPort: number;
    wsPort: number;
    host: string;
    cwd: string;
    localStartTime: string | null;
    gestureAppState: GestureAppState;
  };
}

export const isAppInfoMessage = (message: BaseMessage): message is AppInfoMessage => message.type === "appInfo";