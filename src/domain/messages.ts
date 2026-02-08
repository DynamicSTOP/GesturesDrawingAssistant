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
    currentMediaId: string | null;
    currentSlideShowInterval: number;
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


export interface GetMediaIdsListMessage extends BaseMessage {
  type: "getMediaIdsList";
  data: {
    mediaFolder: string;
    mediaIds?: string[];
  };
}

export const isGetMediaIdsListMessage = (message: BaseMessage): message is GetMediaIdsListMessage => message.type === "getMediaIdsList";


export interface ChangeCurrentSlideShowIntervalMessage extends BaseMessage {
  type: "changeCurrentSlideShowInterval";
  data: {
    interval: number;
  };
}

// eslint-disable-next-line id-length
export const isChangeCurrentSlideShowIntervalMessage = (message: BaseMessage): message is ChangeCurrentSlideShowIntervalMessage => message.type === "changeCurrentSlideShowInterval";

export interface StartSlideShowMessage extends BaseMessage {
  type: "startSlideShow";
  data: {
    interval: number;
  };
}

export const isStartSlideShowMessage = (message: BaseMessage): message is StartSlideShowMessage => message.type === "startSlideShow";

export interface GestureAppStateMessage extends BaseMessage {
  type: "gestureAppState";
  data: {
    state: GestureAppState;
  };
}

export const isGestureAppStateMessage = (message: BaseMessage): message is GestureAppStateMessage => message.type === "gestureAppState";

export interface GestureAppCurrentMediaIdMessage extends BaseMessage {
  type: "gestureAppCurrentMediaId";
  data: {
    currentMediaId: string | null;
  };
}

export const isGestureAppCurrentMediaIdMessage = (message: BaseMessage): message is GestureAppCurrentMediaIdMessage => message.type === "gestureAppCurrentMediaId";