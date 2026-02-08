import { Box, Heading, Spinner, Theme } from "@radix-ui/themes";
import { useCallback, useContext, useEffect, useState } from "react";

import type { ConnectionStatus } from "../domain/connection";
import { isAppMessageEvent, isConnectionStatusEvent } from "../domain/customEvents";
import { isAppInfoMessage } from "../domain/messages";
import { NonPrivileged } from "./components/nonPrivileged/NonPrivileged";
import { AppContext } from "./components/privileged/context/AppContext";
import { Privileged } from "./components/privileged/Privileged";

export function App(): React.JSX.Element {

  const { appInfo, setAppInfo, frontendNetwork } = useContext(AppContext);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(frontendNetwork.getConnectionStatus());

  const connectionStatusCallback = useCallback((event: Event) => {
    if (isConnectionStatusEvent(event)) {
      setConnectionStatus(event.detail.status);
    }
  }, []);


  const appInfoCallback = useCallback((event: Event) => {
    if (isAppMessageEvent(event) && isAppInfoMessage(event.detail)) {
      setAppInfo(event.detail.data);
    }
  }, [setAppInfo]);

  useEffect(() => frontendNetwork.addListener("connectionStatus", connectionStatusCallback), [connectionStatusCallback, frontendNetwork]);
  useEffect(() => frontendNetwork.addListener("appMessage", appInfoCallback), [appInfoCallback, frontendNetwork]);

  if (connectionStatus !== "connected" || appInfo === null) {
    return (
      <Box p="6">
        <Heading size="7" mb="4">
          {connectionStatus} {appInfo === null ? "null" : "not null"}
          Connecting to app... <Spinner />
        </Heading>
      </Box>
    );
  }
  const { isPrivileged } = appInfo;

  return <Theme appearance="dark">
    {isPrivileged ? (<Privileged />) : (<NonPrivileged />)}
  </Theme>
}
