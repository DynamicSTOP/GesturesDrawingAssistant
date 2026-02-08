import type { GestureApp } from "./gestureApp";
import { createHttpServer } from "./server/httpServer";
import { createWsServer } from "./server/wsServer";


export interface StartServerProps {
  httpPort: number,
  wsPort: number,
  host: string,
  gestureApp: GestureApp,
}

export async function startServer(props: StartServerProps): Promise<void> {
  try {
    await Promise.all([
      createHttpServer(props),
      createWsServer(props),
    ]);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}
