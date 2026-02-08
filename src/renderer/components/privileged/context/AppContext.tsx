import type { Dispatch, SetStateAction } from "react";
import React, { createContext, useCallback, useEffect, useMemo, useState } from "react";

import { isAppMessageEvent, isConnectionStatusEvent } from "../../../../domain/customEvents";
import type { MediaFiles } from "../../../../domain/filesystem";
import type { AppInfoMessage } from "../../../../domain/messages";
import { isChangeCurrentSlideShowIntervalMessage, isGestureAppCurrentMediaIdMessage, isGestureAppStateMessage } from "../../../../domain/messages";
import { FrontendNetwork } from "../../../frontendNetwork";

interface AppContextType {
  appInfo: AppInfoMessage['data'] | null;
  setAppInfo: Dispatch<SetStateAction<AppInfoMessage['data'] | null>>;
  frontendNetwork: FrontendNetwork;
  selectedFolderPath: string | null;
  setSelectedFolderPath: Dispatch<SetStateAction<string | null>>;
  files: MediaFiles;
  setFiles: Dispatch<SetStateAction<MediaFiles>>;
}

const notImplemented = () => {
  throw new Error("not implemented");
};

const frontendNetwork = new FrontendNetwork();

frontendNetwork.addEventListener("connectionStatus", (event) => {
  if (isConnectionStatusEvent(event)) {
    console.log("Connection status:", event.detail.status);
  }
});

frontendNetwork.addEventListener("appMessage", (event) => {
  if (isAppMessageEvent(event)) {
    console.log("App message:", event.detail);
  }
});

export const AppContext = createContext<AppContextType>({
  appInfo: null,
  setAppInfo: notImplemented,
  frontendNetwork,
  selectedFolderPath: null,
  setSelectedFolderPath: notImplemented,
  files: [],
  setFiles: notImplemented,
});

AppContext.displayName = "AppContext";

export const AppContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [appInfo, setAppInfo] = useState<AppInfoMessage['data'] | null>(null);
  const [selectedFolderPath, setSelectedFolderPath] = useState<string | null>(null);
  const [files, setFiles] = useState<MediaFiles>([]);



  const currentMediaIdCallback = useCallback((event: Event) => {
    if (isAppMessageEvent(event) && isGestureAppCurrentMediaIdMessage(event.detail)) {
      const { currentMediaId } = event.detail.data;
      setAppInfo(old => old === null ? null : ({ ...old, currentMediaId }));
    }
  }, [setAppInfo]);
  useEffect(() => frontendNetwork.addListener("appMessage", currentMediaIdCallback), [currentMediaIdCallback]);

  const currentSlideShowIntervalCallback = useCallback((event: Event) => {
    if (isAppMessageEvent(event) && isChangeCurrentSlideShowIntervalMessage(event.detail)) {
      const { interval } = event.detail.data;
      setAppInfo(old => old === null ? null : ({ ...old, currentSlideShowInterval: interval }));
    }
  }, [setAppInfo]);
  useEffect(() => frontendNetwork.addListener("appMessage", currentSlideShowIntervalCallback), [currentSlideShowIntervalCallback]);

  const currentStateCallback = useCallback((event: Event) => {
    if (isAppMessageEvent(event) && isGestureAppStateMessage(event.detail)) {
      const { state } = event.detail.data;
      setAppInfo(old => old === null ? null : ({ ...old, gestureAppState: state }));
    }
  }, [setAppInfo]);
  useEffect(() => frontendNetwork.addListener("appMessage", currentStateCallback), [currentStateCallback]);


  const value = useMemo(() => ({ appInfo, setAppInfo, frontendNetwork, selectedFolderPath, setSelectedFolderPath, files, setFiles }),
    [appInfo, selectedFolderPath, files]);

  return <AppContext.Provider value={value}>
    {children}
  </AppContext.Provider>
}
