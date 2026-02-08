import type { AppInfoMessage } from "../../../domain/messages";
import { getSetting } from "../../database";
import type { GestureApp } from "../../gestureApp";
import type { CreateWsServerProps } from "../wsServer";

export const appInfo = ({ serverProps: { db, httpPort, wsPort, host }, isPrivileged, gestureApp }
  : { serverProps: CreateWsServerProps, isPrivileged: boolean, gestureApp: GestureApp }) => {
  const localStartTime = getSetting(db, "local_start_time");


  const message: AppInfoMessage['data'] = {
    isPrivileged,
    httpPort,
    wsPort,
    host,
    cwd: process.cwd(),
    localStartTime: localStartTime ?? null,
    gestureAppState: gestureApp.getState(),
  }
  return message;
}