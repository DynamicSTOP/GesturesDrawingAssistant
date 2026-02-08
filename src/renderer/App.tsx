import { Box, Heading, Text } from "@radix-ui/themes";
import { useEffect, useRef, useState } from "react";

import type { AppInfoMessage } from "../domain/messages";

export function App(): React.JSX.Element {

  const [appInfo, setAppInfo] = useState<AppInfoMessage['data'] | null>(null);
  const [websocketInfo, setWebsocketInfo] = useState<AppInfoMessage['data'] | null>(null);
  const [connectionStatus, setConnectionStatus] = useState("Connecting...");
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    fetch("/app/info")
      .then(async res => res.json() as Promise<AppInfoMessage['data']>)
      .then((data: AppInfoMessage['data']) => {
        setWebsocketInfo(data);
      })
      .catch((error: unknown) => {
        console.error(error);
      });
  }, []);

  useEffect(() => {
    if (websocketInfo === null) {
      return;
    }
    const wsUrl = `ws://${websocketInfo.host}:${websocketInfo.wsPort}`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.addEventListener("open", () => {
      setConnectionStatus("Connected");
      ws.send(JSON.stringify({ type: "appInfo", data: {} }));
    });

    ws.addEventListener("message", (event) => {
      try {
        const message = JSON.parse(String(event.data)) as {
          type: string;
          data: AppInfoMessage['data'];
        };

        if (message.type === "appInfo") {
          setAppInfo(message.data);
        }
      } catch {
        // Ignore malformed messages
      }
    });

    ws.addEventListener("close", () => {
      setConnectionStatus("Disconnected");
    });

    ws.addEventListener("error", () => {
      setConnectionStatus("Connection error");
    });

    return () => {
      ws.close();
      wsRef.current = null;
    };
  }, [websocketInfo]);

  return (
    <Box p="6">
      <Heading size="7" mb="4">
        Hello World
      </Heading>
      <Text as="p" size="3" mb="2">
        Is Privileged: {(websocketInfo?.isPrivileged ?? false) ? "Yes" : "No"}
      </Text>
      <Text as="p" size="3" mb="2">
        HTTP Port: {websocketInfo?.httpPort}
      </Text>
      <Text as="p" size="3" mb="2">
        WebSocket Port: {websocketInfo?.wsPort}
      </Text>
      <Text as="p" size="3" mb="2">
        Gesture App State: {websocketInfo?.gestureAppState}
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
