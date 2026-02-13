import { Flex, Spinner, Text } from "@radix-ui/themes";
import { useCallback, useContext, useEffect, useRef, useState } from "react";

import type { GestureAppState } from "../../domain/gestureApp";
import { GestureAppStateEnum } from "../../domain/gestureApp";
import type { AppInfoMessage, GestureAppSwitchMediaMessage, SetGestureAppStateMessage } from "../../domain/messages";
import type { FrontendNetwork } from "../frontendNetwork";
import { AppContext } from "./privileged/context/AppContext";

interface ActiveSessionProps {
  isPrivileged?: boolean;
  appInfo: AppInfoMessage['data'];
}



const sendChangeAppState = (frontendNetwork: FrontendNetwork, newGestureAppState: GestureAppState) => {
  const setGestureAppStateMessage: SetGestureAppStateMessage = {
    type: "setGestureAppState",
    data: { newGestureAppState },
  };
  frontendNetwork.send(setGestureAppStateMessage);
}

const sendSwitchMedia = (frontendNetwork: FrontendNetwork, forward: boolean) => {
  const switchMediaMessage: GestureAppSwitchMediaMessage = {
    type: "gestureAppSwitchMedia",
    data: { forward },
  };
  frontendNetwork.send(switchMediaMessage);
}

export const ActiveSession: React.FC<ActiveSessionProps> = ({ appInfo, isPrivileged = false }) => {
  const { httpPort, host, greyscale, currentSlideShowInterval, flipped, currentMediaId, gestureAppState } = appInfo;
  const baseUrl = `http://${host}:${httpPort}/static/`;
  const { frontendNetwork } = useContext(AppContext);

  const lastEscapeTimestamp = useRef<number>(0);

  const keyListener = useCallback((event: KeyboardEvent) => {
    const key = event.key.toLowerCase();
    switch (key) {
      case 'escape': {
        if (Date.now() - lastEscapeTimestamp.current > 1000) {
          lastEscapeTimestamp.current = Date.now();
          return;
        }
        sendChangeAppState(frontendNetwork, GestureAppStateEnum.IDLE);
        break;
      }
      case ' ':
      case 'space': {
        sendChangeAppState(frontendNetwork, gestureAppState === GestureAppStateEnum.SLIDESHOW ? GestureAppStateEnum.MANUAL : GestureAppStateEnum.SLIDESHOW);
        break;
      }
      case 'arrowright': {
        sendSwitchMedia(frontendNetwork, true);
        break;
      }
      case 'arrowleft': {
        sendSwitchMedia(frontendNetwork, false);
        break;
      }
      // No default
    }
  }, [frontendNetwork, gestureAppState]);

  useEffect(() => {
    if (!isPrivileged) {
      return;
    }
    window.addEventListener('keyup', keyListener);
    return () => {
      window.removeEventListener('keyup', keyListener);
    };
  }, [keyListener, isPrivileged]);

  const [imageBlobUrl, setImageBlobUrl] = useState<string | null>(null);

  useEffect(() => {
    setImageBlobUrl(null);

    fetch(`${baseUrl}${currentMediaId}`)
      .then(async response => response.blob())
      .then(blob => {
        const url = URL.createObjectURL(blob);
        setImageBlobUrl(old => {
          if (old === null) {
            return url;
          }
          URL.revokeObjectURL(old);
          return url;
        });
      }).catch(console.error);
  }, [baseUrl, currentMediaId, flipped]);

  if (currentMediaId === null || imageBlobUrl === null) {
    return <Flex align="center" justify="center" direction="column" style={{ minHeight: "100vh" }}>
      <Text size="2" color="gray">Loading media...</Text>
      <Spinner size='3' />
    </Flex>;
  }

  return <Flex align="center" justify="center" style={{ minHeight: "100vh" }}>
    <img
      src={imageBlobUrl}
      alt="Media"
      style={{
        maxWidth: "98vw",
        maxHeight: "calc(98vh - 20px)",
        marginTop: "1vh",
        width: "auto",
        height: "auto",
        display: "block",
        margin: "auto",
        objectFit: "contain",
        filter: `grayscale(${greyscale / 100})`,
        transform: flipped ?? false ? "scaleX(-1)" : ""
      }}
    />
    {/* Progress Bar at the bottom */}
    {gestureAppState === GestureAppStateEnum.SLIDESHOW && <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        width: "100vw",
        height: "20px",
        background: "#222",
        zIndex: 10,
        overflow: "hidden"
      }}
    >

      <div
        key={currentMediaId} // restart animation on index change
        style={{
          height: "100%",
          width: "100%",
          background: "linear-gradient(90deg, #A78BFA, #7C3AED)",
          transform: "scaleX(0)",
          transformOrigin: "left",
          animation: `session-progress-bar-grow ${currentSlideShowInterval}ms linear forwards`
        }}
      />
      <style>
        {`
            @keyframes session-progress-bar-grow {
              from {
                transform: scaleX(0);
              }
              to {
                transform: scaleX(1);
              }
            }
          `}
      </style>
    </div>}
  </Flex>
};