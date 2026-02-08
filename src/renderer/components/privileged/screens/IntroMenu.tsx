import { Box, Button, Flex, Text } from "@radix-ui/themes";
import { useCallback, useContext, } from "react";

import type { StartSlideShowMessage } from "../../../../domain/messages";
import { QRCode } from "../../QRCode";
import { AppContext } from "../context/AppContext";
import type { CurrentScreen } from "../Privileged";


export const IntroMenu: React.FC<{ setCurrentScreen: (screen: CurrentScreen) => void }> = ({ setCurrentScreen }) => {
  const { appInfo, frontendNetwork } = useContext(AppContext);

  const handleSetCurrentScreen = useCallback<React.MouseEventHandler<HTMLButtonElement>>(({ currentTarget: { value } }) => {
    setCurrentScreen(value as CurrentScreen);
  }, [setCurrentScreen]);

  const startSlideShow = useCallback(() => {
    const startSlideShowMessage: StartSlideShowMessage = {
      type: "startSlideShow",
      data: {
        interval: 30000,
      },
    };
    frontendNetwork.send(startSlideShowMessage);
  }, [frontendNetwork]);

  if (appInfo === null) {
    return null;
  }

  const { httpPort, host, mediaFolder } = appInfo;
  const localhostUrl = `http://${host}:${httpPort}/app/`;

  return <Flex align="center" justify="center" style={{ minHeight: "100vh" }}>
    <Box
      p="6"
      style={{
        border: "1px solid var(--gray-6)",
        borderRadius: "var(--radius-3)",
        backgroundColor: "var(--color-panel-solid)",
      }}
    >
      <Flex direction="column" gap="6" align="center">
        <Button size="3" variant="solid" style={{ width: "100%" }} onClick={handleSetCurrentScreen} value="selectFolder">
          Select Folder
        </Button>

        {mediaFolder ? <Text size="2" color="gray">Current Media Folder: {mediaFolder}</Text> : null}

        {mediaFolder ? <Button size="3" variant="solid" style={{ width: "100%" }} onClick={startSlideShow} value="activeSession">
          Start
        </Button> : null}

        <QRCode url={localhostUrl} />
      </Flex>
    </Box>
  </Flex>
}