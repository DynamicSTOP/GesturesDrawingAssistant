import "@radix-ui/themes/styles.css";
import "./App.css";

import { Theme } from "@radix-ui/themes";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { isAppMessageEvent, isConnectionStatusEvent } from "../domain/customEvents";
import { App } from "./App";
import { FrontendNetwork } from "./frontendNetwork";

const frontendNetwork = new FrontendNetwork();

frontendNetwork.addEventListener("connectionStatus", (event) => {
  if (isConnectionStatusEvent(event)) {
    console.log("Connection status:", event.detail.status);
  }
});

frontendNetwork.addEventListener("appMessage", (event) => {
  if (isAppMessageEvent(event)) {
    console.log("App message:", event.detail);
  }
});

const rootElement = document.querySelector("#root");
if (rootElement !== null) {
  createRoot(rootElement).render(
    <StrictMode>
      <Theme appearance="dark" accentColor="violet">
        <App frontendNetwork={frontendNetwork} />
      </Theme>
    </StrictMode>
  );
}
