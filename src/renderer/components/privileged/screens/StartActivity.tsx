import { Box, Button, Flex, Heading, Separator, Slider, Spinner, Switch, Text } from "@radix-ui/themes";
import { useCallback, useContext, useMemo, useState } from "react";

import { GestureAppStateEnum } from "../../../../domain/gestureApp";
import type { SetGestureAppStateMessage } from "../../../../domain/messages";
import { mediaFolderName } from "../../../utils/mediaFolder";
import { AppContext } from "../context/AppContext";
import type { CurrentScreen } from "../Privileged";

interface StartActivityProps {
  setCurrentScreen: (screen: CurrentScreen) => void;
}

const predefinedIntervals = [
  { label: "10 sec", value: 10000 },
  { label: "30 sec", value: 30000 },
  { label: "1 min", value: 60000 },
  { label: "2 min", value: 120000 },
  { label: "3 min", value: 180000 },
  { label: "4 min", value: 240000 },
  { label: "5 min", value: 300000 },
  { label: "10 min", value: 600000 },
]

const boxStyles = {
  border: "1px solid var(--gray-6)",
  borderRadius: "var(--radius-3)",
  backgroundColor: "var(--color-panel-solid)",
};

const labelsStyles = {
  minWidth: "150px",
  whiteSpace: "nowrap",
};

export const StartActivity: React.FC<StartActivityProps> = ({ setCurrentScreen }) => {
  const { frontendNetwork, appInfo } = useContext(AppContext);

  const [isStarting, setIsStarting] = useState(false);
  const [slideShowInterval, setSlideShowInterval] = useState<number[]>([appInfo?.currentSlideShowInterval ?? 30000]);
  const [rerenderKey, setRerenderKey] = useState<number>(0);
  const [greyscale, setGreyscale] = useState<number[]>([appInfo?.greyscale ?? 0]);

  const back = useCallback(() => {
    setCurrentScreen("introMenu");
  }, [setCurrentScreen]);

  const setPredefinedInterval = useCallback<React.MouseEventHandler<HTMLButtonElement>>(({ currentTarget: { value, form } }) => {
    if (form === null) {
      return;
    }
    // const slideShowIntervalInput = form.elements.namedItem("slideShowInterval");
    // if (slideShowIntervalInput instanceof HTMLInputElement) {
    // slideShowIntervalInput.value = value;
    // }
    setSlideShowInterval([Number.parseInt(value, 10)]);
    setRerenderKey(old => old + 1);
  }, []);

  const startSlideShow = useCallback<React.ReactEventHandler<HTMLButtonElement>>(({ currentTarget: { form } }) => {
    if (form === null) {
      return;
    }
    const formData = new FormData(form);
    const intervalValue = Number.parseInt(formData.get("slideShowInterval") as string, 10);
    if (Number.isNaN(intervalValue)) {
      return;
    }
    const greyscaleValue = Number.parseInt(formData.get("greyscale") as string, 10);
    if (Number.isNaN(greyscaleValue)) {
      return;
    }
    const randomFlipValue = formData.get("randomFlip") as string;

    setSlideShowInterval([intervalValue]);
    setIsStarting(true);
    const setGestureAppStateMessage: SetGestureAppStateMessage = {
      type: "setGestureAppState",
      data: {
        newGestureAppState: GestureAppStateEnum.SLIDESHOW,
        slideShowInterval: intervalValue,
        greyscale: greyscaleValue,
        randomFlip: randomFlipValue === "on",
      },
    };
    frontendNetwork.send(setGestureAppStateMessage);
  }, [frontendNetwork]);


  const isDisabled = isStarting;


  const intervalText = useMemo(() => {
    const seconds = slideShowInterval[0] / 1000;
    const minutes = seconds / 60;

    const minStr = Math.floor(minutes) > 0 ? `${Math.floor(minutes)} min` : '';
    const secStr = Math.floor(seconds % 60) > 0 ? `${Math.floor(seconds % 60)} s` : '';
    if (minStr === '' && secStr === '') {
      return '';
    }
    return `${minStr} ${secStr}`.trim();
  }, [slideShowInterval]);

  if (appInfo === null) {
    return null;
  }



  return (
    <form>
      <Flex align="center" justify="center" style={{ minHeight: "100vh" }}>
        <Box
          p="6"
          style={boxStyles}
        >
          <Flex direction="column" gap="4" align="center">
            <Heading>Select Folder</Heading>
            <Text size="2" color="gray">Start Activity</Text>
            <Separator />
            <Text size="2" color="gray">Current Media Folder: {mediaFolderName(appInfo.mediaFolder)}</Text>
            <Separator />

            <Box p="4" style={{ ...boxStyles, width: "100%", minHeight: '120px' }}>
              <Flex direction="column" gap="4" align="center" justify="center">
                <Flex direction="row" gap="4" align="center" justify="between" my="4" style={{ width: "100%" }}>
                  <Text as="label" htmlFor="greyscale" size="4" style={labelsStyles} color="gray">Greyscale</Text>
                  <Slider style={{ filter: `grayscale(${greyscale[0] / 100})` }} id="greyscale" name="greyscale" defaultValue={greyscale} onValueChange={setGreyscale} min={0} max={100} step={1} size="3" />
                  <Text size="4" color="gray">{greyscale[0]}%</Text>
                </Flex>

                <Flex direction="row" gap="4" align="center" justify="between" mt="4" style={{ width: "100%" }}>
                  <Text as="label" htmlFor="slideShowInterval" size="4" style={labelsStyles} color="gray">Slide Show Interval</Text>
                  <Slider key={rerenderKey} id="slideShowInterval" name="slideShowInterval" defaultValue={slideShowInterval} onValueChange={setSlideShowInterval} min={10000} max={600000} step={1000} size="3" />
                  <Text size="4" color="gray">{intervalText}</Text>
                </Flex>

                <Flex direction="row" gap="4" align="center" justify="between" mb="4" style={{ width: "100%" }}>
                  {predefinedIntervals.map(({ label, value }) => (
                    <Button size="3" variant="ghost" type="button" onClick={setPredefinedInterval} value={value} disabled={isDisabled} key={value}>
                      {label}
                    </Button>
                  ))}
                </Flex>

                <Flex direction="row" gap="4" align="center" justify="start" my="4" style={{ width: "100%" }}>
                  <Switch id="randomFlip" name="randomFlip" defaultChecked={appInfo.randomFlip} />
                  <Text as="label" htmlFor="randomFlip" size="4" style={labelsStyles} color="gray">Random flip</Text>
                </Flex>
              </Flex>
            </Box>

            <Flex direction="row" gap="4" align="center" justify="between" style={{ width: "100%" }}>
              <Button size="3" variant="ghost" onClick={back} disabled={isDisabled}>
                Back to intro menu
              </Button>
              <Button size="3" variant="solid" onClick={startSlideShow} disabled={isDisabled}>
                Start {isStarting ? <Spinner /> : null}
              </Button>
            </Flex>
          </Flex >
        </Box >
      </Flex >
    </form >
  )
};