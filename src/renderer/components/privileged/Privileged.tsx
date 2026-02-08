import { useCallback, useContext, useEffect, useState } from "react";

import { isAppMessageEvent } from "../../../domain/customEvents";
import { isSetMediaFolderMessage } from "../../../domain/messages";
import { AppContext } from "./context/AppContext";
import { ActiveSession } from "./screens/ActiveSession";
import { IntroMenu } from "./screens/IntroMenu";
import { SelectFolder } from "./screens/SelectFolder";


export type CurrentScreen = "introMenu" | "selectFolder" | "activeSession";

export const Privileged: React.FC = () => {
  const { frontendNetwork, setAppInfo, appInfo } = useContext(AppContext);
  const [currentScreen, setCurrentScreen] = useState<CurrentScreen>("introMenu");


  const mediaFolderCallback = useCallback((event: Event) => {
    if (isAppMessageEvent(event) && isSetMediaFolderMessage(event.detail)) {
      const { mediaFolder } = event.detail.data;
      setAppInfo(old => old === null ? null : ({ ...old, mediaFolder }));
      setCurrentScreen("introMenu");
    }
  }, [setAppInfo]);

  useEffect(() => frontendNetwork.addListener("appMessage", mediaFolderCallback), [mediaFolderCallback, frontendNetwork]);


  if (currentScreen === "introMenu") {
    return <IntroMenu setCurrentScreen={setCurrentScreen} />;
  }

  if (currentScreen === "selectFolder") {
    return <SelectFolder setCurrentScreen={setCurrentScreen} />;
  }

  if (appInfo === null) {
    return null;
  }

  const baseUrl = `http://${appInfo.host}:${appInfo.httpPort}/static/`;

  return <ActiveSession baseUrl={baseUrl} setCurrentScreen={setCurrentScreen} mediaFolder={appInfo.mediaFolder} />;
};
