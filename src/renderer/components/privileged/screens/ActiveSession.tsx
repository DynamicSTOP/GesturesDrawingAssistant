import { Flex, Spinner } from "@radix-ui/themes";
import { useCallback, useContext, useEffect, useState } from "react";

import { isAppMessageEvent } from "../../../../domain/customEvents";
import { shuffleArray } from "../../../../domain/helpers";
import type { GetMediaIdsListMessage } from "../../../../domain/messages";
import { isGetMediaIdsListMessage } from "../../../../domain/messages";
import { AppContext } from "../context/AppContext";
import type { CurrentScreen } from "../Privileged";

interface ActiveSessionProps {
  baseUrl: string;
  mediaFolder: string;
  setCurrentScreen: (screen: CurrentScreen) => void;
}

export const ActiveSession: React.FC<ActiveSessionProps> = ({ baseUrl, mediaFolder }) => {
  const { frontendNetwork } = useContext(AppContext);

  const [isLoading, setLoading] = useState(true);
  const [mediasIdsList, setMediasIdsList] = useState<string[]>([]);
  const [currentSwitchInterval, setCurrentSwitchInterval] = useState<number>(15000);

  useEffect(() => {
    const getMediaIdsListMessage: GetMediaIdsListMessage = {
      type: "getMediaIdsList",
      data: { mediaFolder },
    };
    frontendNetwork.send(getMediaIdsListMessage);
  }, [frontendNetwork, mediaFolder]);

  const getMediasListHandler = useCallback((event: Event) => {
    if (isAppMessageEvent(event) && isGetMediaIdsListMessage(event.detail)) {
      setLoading(false);
      const mediaIds = event.detail.data.mediaIds ?? [];
      shuffleArray(mediaIds);
      setMediasIdsList(mediaIds);
    }
  }, [setLoading]);

  useEffect(() => frontendNetwork.addListener("appMessage", getMediasListHandler), [getMediasListHandler, frontendNetwork]);

  const [currentMediaIndex, setCurrentMediaIndex] = useState<number>(0);

  useEffect(() => {
    setCurrentMediaIndex(0);
    if (mediasIdsList.length === 0 || currentSwitchInterval === 0) {
      return;
    }
    const interval = setInterval(() => {
      setCurrentMediaIndex(old => (old + 1) % mediasIdsList.length);
    }, currentSwitchInterval);

    return () => {
      clearInterval(interval);
    };
  }, [mediasIdsList, currentSwitchInterval]);

  const currentMediaId = mediasIdsList.at(currentMediaIndex);

  if (isLoading || currentMediaId === undefined) {
    return <Flex align="center" justify="center" style={{ minHeight: "100vh" }}>
      <Spinner />
    </Flex>;
  }

  return (
    <Flex align="center" justify="center" style={{ minHeight: "100vh" }}>
      <img
        src={`${baseUrl}${currentMediaId}`}
        alt="Media"
        style={{
          maxWidth: "98vw",
          maxHeight: "98vh",
          width: "auto",
          height: "auto",
          display: "block",
          margin: "auto",
          objectFit: "contain"
        }}
      />

    </Flex>
  );
}