import { Box, Button, Flex, Heading, Separator, Spinner, Text } from "@radix-ui/themes";
import { useCallback, useContext, useEffect, useState } from "react";

import { isAppMessageEvent } from "../../../../domain/customEvents";
import type { Folders } from "../../../../domain/filesystem";
import type { SetMediaFolderMessage } from "../../../../domain/messages";
import { isListFolderMessage } from "../../../../domain/messages";
import { AppContext } from "../context/AppContext";
import type { CurrentScreen } from "../Privileged";

interface SelectFolderProps {
  setCurrentScreen: (screen: CurrentScreen) => void;
}

export const SelectFolder: React.FC<SelectFolderProps> = ({ setCurrentScreen }) => {
  const { frontendNetwork, appInfo } = useContext(AppContext);

  const [folders, setFolders] = useState<Folders | null>(null);
  const [requesting, setRequesting] = useState(false);
  const [currentFolder, setCurrentFolder] = useState<string>(appInfo?.mediaFolder ?? appInfo?.cwd ?? "");
  const [isSettingAppFolder, setIsSettingAppFolder] = useState(false);


  const back = useCallback(() => {
    setCurrentScreen("introMenu");
  }, [setCurrentScreen]);

  const requestFolder = useCallback((path: string) => {
    setRequesting(true);
    frontendNetwork.send({ type: "listFolderRequest", data: { path } });
  }, [frontendNetwork]);

  const listFolderHandler = useCallback((event: Event) => {
    if (isAppMessageEvent(event) && isListFolderMessage(event.detail)) {
      setRequesting(false);
      setFolders(event.detail.data);
      setCurrentFolder(event.detail.data.path);
    }
  }, [setFolders]);

  useEffect(() => frontendNetwork.addListener("appMessage", listFolderHandler), [listFolderHandler, frontendNetwork]);

  useEffect(() => {
    requestFolder(currentFolder);
  }, [requestFolder, currentFolder]);

  const updateCurrentFolder = useCallback<React.MouseEventHandler<HTMLButtonElement>>(({ currentTarget: { value } }) => {
    setCurrentFolder(old => `${old}/${value}`);
  }, [setCurrentFolder]);

  const setMediaFolder = useCallback<React.MouseEventHandler<HTMLButtonElement>>(({ currentTarget: { value } }) => {
    setIsSettingAppFolder(true);
    const setMediaFolderMessage: SetMediaFolderMessage = {
      type: "setMediaFolder",
      data: { mediaFolder: value },
    };
    frontendNetwork.send(setMediaFolderMessage);
  }, [frontendNetwork]);


  const isDisabled = isSettingAppFolder || requesting || folders === null;

  return (
    <Flex align="center" justify="center" style={{ minHeight: "100vh" }}>
      <Box
        p="6"
        style={{
          border: "1px solid var(--gray-6)",
          borderRadius: "var(--radius-3)",
          backgroundColor: "var(--color-panel-solid)",
        }}
      >
        <Flex direction="column" gap="4" align="center">
          <Heading>Select Folder</Heading>
          <Text size="2" color="gray">{currentFolder}</Text>
          <Separator />
          {folders ? <Text size="2" color="gray">{folders.files} files in folder</Text> : null}
          <Separator />

          {(requesting || folders === null) ? <Spinner /> : <Box style={{ height: "400px", overflowY: "auto", minWidth: '400px', overflowX: "hidden" }}>
            {currentFolder === "/" ? null : <Button size="3" variant="ghost" style={{ width: "100%", marginBottom: "10px" }} onClick={updateCurrentFolder}
              value=".." key=".." disabled={isDisabled}>
              ..
            </Button>}
            {folders.folderNames.map((folder) => (
              <Button size="3" variant="ghost" style={{ width: "100%", marginBottom: "10px" }} onClick={updateCurrentFolder}
                value={folder} key={folder} disabled={isDisabled}>
                {folder}
              </Button>
            ))}
          </Box>}

          <Flex direction="row" gap="4" align="center" justify="between" style={{ width: "100%" }}>
            <Button size="3" variant="ghost" onClick={back} disabled={isDisabled}>
              Back to intro menu
            </Button>
            <Button size="3" variant="solid" value={currentFolder} onClick={setMediaFolder} disabled={isDisabled}>
              Select this folder
            </Button>
          </Flex>
        </Flex>
      </Box>
    </Flex>
  )
};