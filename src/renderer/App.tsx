import { Box, Heading, Text } from "@radix-ui/themes";
import { useCallback, useEffect, useState } from "react";

import { isAppMessageEvent, isConnectionStatusEvent } from "../domain/customEvents";
import type { AppInfoMessage } from "../domain/messages";
import { isAppInfoMessage } from "../domain/messages";
import type { ConnectionStatus, FrontendNetwork } from "./frontendNetwork";

export function App({ frontendNetwork }: { frontendNetwork: FrontendNetwork }): React.JSX.Element {

  const [appInfo, setAppInfo] = useState<AppInfoMessage['data'] | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(frontendNetwork.getConnectionStatus());

  const connectionStatusCallback = useCallback((event: Event) => {
    if (isConnectionStatusEvent(event)) {
      setConnectionStatus(event.detail.status);
    }
  }, []);

  useEffect(() => {
    frontendNetwork.addEventListener("connectionStatus", connectionStatusCallback);
    return () => {
      frontendNetwork.removeEventListener("connectionStatus", connectionStatusCallback);
    };
  }, [connectionStatusCallback, frontendNetwork]);

  const appInfoCallback = useCallback((event: Event) => {
    if (isAppMessageEvent(event) && isAppInfoMessage(event.detail)) {
      setAppInfo(event.detail.data);
    }
  }, []);

  useEffect(() => {
    frontendNetwork.addEventListener("appMessage", appInfoCallback);
    return () => {
      frontendNetwork.removeEventListener("appMessage", appInfoCallback);
    };
  }, [appInfoCallback, frontendNetwork]);


  return (
    <Box p="6">
      <Heading size="7" mb="4">
        Hello World
      </Heading>
      <Text as="p" size="3" mb="2">
        Is Privileged: {(appInfo?.isPrivileged ?? false) ? "Yes" : "No"}
      </Text>
      <Text as="p" size="3" mb="2">
        HTTP Port: {appInfo?.httpPort}
      </Text>
      <Text as="p" size="3" mb="2">
        WebSocket Port: {appInfo?.wsPort}
      </Text>
      <Text as="p" size="3" mb="2">
        Gesture App State: {appInfo?.gestureAppState}
      </Text>
      <Text as="p" size="3" mb="2">
        WebSocket Status: {connectionStatus}
      </Text>
      {appInfo !== null && (
        <>
          <Text as="p" size="3" mb="2">
            Working Directory: {appInfo.cwd}
          </Text>
          {appInfo.localStartTime !== null && (
            <Text as="p" size="3" mb="2">
              Local Start Time:{" "}
              {new Date(Number(appInfo.localStartTime)).toLocaleString()}
            </Text>
          )}
        </>
      )}
    </Box>
  );
}
