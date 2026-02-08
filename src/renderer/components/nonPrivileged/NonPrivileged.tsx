import { Box, Heading, Spinner } from "@radix-ui/themes";
import { useContext } from "react";

import { ActiveSession } from "../ActiveSession";
import { AppContext } from "../privileged/context/AppContext";
import { QRCode } from "../QRCode";

export const NonPrivileged: React.FC = () => {
  const { appInfo } = useContext(AppContext);

  if (appInfo === null) {
    return null;
  }

  const { httpPort, host, currentMediaId, currentSlideShowInterval, gestureAppState } = appInfo;
  const serverUrl = `http://${host}:${httpPort}/app/`;
  const baseUrl = `http://${host}:${httpPort}/static/`;

  if (gestureAppState === 'slideshow') {
    return <ActiveSession baseUrl={baseUrl} currentMediaId={currentMediaId ?? ''} currentSlideShowInterval={currentSlideShowInterval} />
  }
  return (
    <Box p="6">
      <Heading size="7" mb="4">
        Waiting for app to start... <Spinner />
      </Heading>
      <QRCode url={serverUrl} />
    </Box>
  )

}