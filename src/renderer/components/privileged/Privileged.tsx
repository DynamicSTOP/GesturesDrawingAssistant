import { useCallback, useContext, useEffect, useState } from "react";

import { isAppMessageEvent } from "../../../domain/customEvents";
import { GestureAppStateEnum } from "../../../domain/gestureApp";
import { isSetMediaFolderMessage } from "../../../domain/messages";
import { ActiveSession } from "../ActiveSession";
import { AppContext } from "./context/AppContext";
import { IntroMenu } from "./screens/IntroMenu";
import { SelectFolder } from "./screens/SelectFolder";
import { StartActivity } from "./screens/StartActivity";



export type CurrentScreen = "introMenu" | "selectFolder" | "activeSession" | "startActivity";

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

  if (appInfo?.gestureAppState === GestureAppStateEnum.IDLE) {
    if (currentScreen === "introMenu") {
      return <IntroMenu setCurrentScreen={setCurrentScreen} />;
    }

    if (currentScreen === "selectFolder") {
      return <SelectFolder setCurrentScreen={setCurrentScreen} />;
    }

    if (currentScreen === "startActivity") {
      return <StartActivity setCurrentScreen={setCurrentScreen} />;
    }
  }

  if (appInfo === null) {
    return null;
  }


  return <ActiveSession
    appInfo={appInfo}
    isPrivileged
  />;
};
