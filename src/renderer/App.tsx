import { Box, Heading, Spinner, Text } from "@radix-ui/themes";
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


  const appInfoCallback = useCallback((event: Event) => {
    if (isAppMessageEvent(event) && isAppInfoMessage(event.detail)) {
      setAppInfo(event.detail.data);
    }
  }, []);

  useEffect(() => frontendNetwork.addListener("connectionStatus", connectionStatusCallback), [connectionStatusCallback, frontendNetwork]);
  useEffect(() => frontendNetwork.addListener("appMessage", appInfoCallback), [appInfoCallback, frontendNetwork]);

  if (connectionStatus !== "connected" || appInfo === null) {
    return (
      <Box p="6">
        <Heading size="7" mb="4">
          Connecting to app... <Spinner />
        </Heading>
      </Box>
    );
  }
  const { isPrivileged, httpPort, wsPort, gestureAppState, localStartTime, cwd } = appInfo;

  return (
    <Box p="6">
      <Heading size="7" mb="4">
        Hello World
      </Heading>
      <Text as="p" size="3" mb="2">
        Is Privileged: {isPrivileged ? "Yes" : "No"}
      </Text>
      <Text as="p" size="3" mb="2">
        HTTP Port: {httpPort}
      </Text>
      <Text as="p" size="3" mb="2">
        WebSocket Port: {wsPort}
      </Text>
      <Text as="p" size="3" mb="2">
        Gesture App State: {gestureAppState}
      </Text>
      <Text as="p" size="3" mb="2">
        WebSocket Status: {connectionStatus}
      </Text>
      <Text as="p" size="3" mb="2">
        Working Directory: {cwd}
      </Text>
      {localStartTime !== null && (
        <Text as="p" size="3" mb="2">
          Local Start Time:{" "}
          {new Date(Number(localStartTime)).toLocaleString()}
        </Text>
      )}
    </Box>
  );
}
