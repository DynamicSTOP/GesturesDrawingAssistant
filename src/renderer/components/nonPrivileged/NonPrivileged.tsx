import { Box, Heading, Spinner } from "@radix-ui/themes";
import { useContext } from "react";

import { GestureAppStateEnum } from "../../../domain/gestureApp";
import { ActiveSession } from "../ActiveSession";
import { AppContext } from "../privileged/context/AppContext";
import { QRCode } from "../QRCode";

export const NonPrivileged: React.FC = () => {
  const { appInfo } = useContext(AppContext);

  if (appInfo === null) {
    return null;
  }

  const { httpPort, host, gestureAppState } = appInfo;
  const serverUrl = `http://${host}:${httpPort}/app/`;

  if (gestureAppState !== GestureAppStateEnum.IDLE) {
    return <ActiveSession
      appInfo={appInfo}
      isPrivileged={false} />
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