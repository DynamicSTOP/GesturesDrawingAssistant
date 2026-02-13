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
    gestureAppState: GestureAppState;
    mediaFolder: string;
    currentMediaId: string | null;
    currentSlideShowInterval: number;
    greyscale: number;
    randomFlip: boolean;
    flipped?: boolean;
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


export interface ChangeCurrentSlideShowIntervalMessage extends BaseMessage {
  type: "changeCurrentSlideShowInterval";
  data: {
    interval: number;
  };
}

// eslint-disable-next-line id-length
export const isChangeCurrentSlideShowIntervalMessage = (message: BaseMessage): message is ChangeCurrentSlideShowIntervalMessage => message.type === "changeCurrentSlideShowInterval";
export interface SetGestureAppStateMessage extends BaseMessage {
  type: "setGestureAppState";
  data: {
    newGestureAppState: GestureAppState;
    slideShowInterval?: number;
    greyscale?: number;
    randomFlip?: boolean;
  };
}

export const isSetGestureAppStateMessage = (message: BaseMessage): message is SetGestureAppStateMessage => message.type === "setGestureAppState";

export interface GestureAppCurrentMediaIdMessage extends BaseMessage {
  type: "gestureAppCurrentMediaId";
  data: {
    currentMediaId: string | null;
    flipped: boolean;
  };
}

export const isGestureAppCurrentMediaIdMessage = (message: BaseMessage): message is GestureAppCurrentMediaIdMessage => message.type === "gestureAppCurrentMediaId";

export interface AppInfoUpdateMessage extends BaseMessage {
  type: "appInfoUpdate";
  data: Partial<AppInfoMessage['data']>;
}

export const isAppInfoUpdateMessage = (message: BaseMessage): message is AppInfoUpdateMessage => message.type === "appInfoUpdate";


export interface GestureAppSwitchMediaMessage extends BaseMessage {
  type: "gestureAppSwitchMedia";
  data: {
    forward: boolean;
  };
}

export const isGestureAppSwitchMediaMessage = (message: BaseMessage): message is GestureAppSwitchMediaMessage => message.type === "gestureAppSwitchMedia";