import type { Folders } from "./filesystem";
import type { GestureAppState } from "./gestureApp";

export interface BaseMessage {
  type: string;
  data: Record<string, unknown>;
}

export const isBaseMessage = (message: unknown): message is BaseMessage => {
  if (message === null || typeof message !== "object") {
    return false;
  }
  const messageObj = message as Record<string, unknown>;
  return "type" in messageObj && typeof messageObj.type === "string"
    && "data" in messageObj && typeof messageObj.data === "object" && messageObj.data !== null;
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
    mediaFolder: string;
  };
}

export const isAppInfoMessage = (message: BaseMessage): message is AppInfoMessage => message.type === "appInfo";


export interface ListFolderMessage extends BaseMessage {
  type: "listFolder";
  data: Folders;
}

export const isListFolderMessage = (message: BaseMessage): message is ListFolderMessage => message.type === "listFolder";

export interface ListFolderRequestMessage extends BaseMessage {
  type: "listFolderRequest";
  data: {
    path?: string;
  };
}

export const isListFolderRequestMessage = (message: BaseMessage): message is ListFolderRequestMessage => message.type === "listFolderRequest";


export interface SetMediaFolderMessage extends BaseMessage {
  type: "setMediaFolder";
  data: {
    mediaFolder: string;
  };
}

export const isSetMediaFolderMessage = (message: BaseMessage): message is SetMediaFolderMessage => message.type === "setMediaFolder";

