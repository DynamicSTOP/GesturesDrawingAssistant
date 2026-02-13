import type { AppInfoMessage } from "../../../domain/messages";
import type { GestureApp } from "../../GestureApp";
import type { CreateWsServerProps } from "../wsServer";

export const appInfo = ({ serverProps: { httpPort, wsPort, host }, isPrivileged, gestureApp }
  : { serverProps: CreateWsServerProps, isPrivileged: boolean, gestureApp: GestureApp }) => {
  const message: AppInfoMessage['data'] = {
    isPrivileged,
    httpPort,
    wsPort,
    host,
    cwd: process.cwd(),
    gestureAppState: gestureApp.getState(),
    mediaFolder: gestureApp.getMediaFolder(),
    currentMediaId: gestureApp.getCurrentMediaId(),
    currentSlideShowInterval: gestureApp.getCurrentSlideShowInterval(),
    greyscale: gestureApp.getCurrentGreyscale(),
    randomFlip: gestureApp.getRandomFlip(),
  }
  return message;
}