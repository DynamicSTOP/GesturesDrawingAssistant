import type { ConnectionStatus } from "./connection";
import type { GestureAppState } from "./gestureApp";
import type { BaseMessage } from "./messages";

export interface ConnectionStatusEventData {
  status: ConnectionStatus;
}

export const isConnectionStatusEvent = (event: Event): event is CustomEvent<ConnectionStatusEventData> => event.type === 'connectionStatus';

export const isAppMessageEvent = (event: Event): event is CustomEvent<BaseMessage> => event.type === 'appMessage';

export const isGestureAppStateEvent = (event: Event): event is CustomEvent<GestureAppState> => event.type === 'gestureAppState';