import "@radix-ui/themes/styles.css";
import "./App.css";

import { Theme } from "@radix-ui/themes";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { App } from "./App";
import { AppContextProvider } from "./components/privileged/context/AppContext";


const rootElement = document.querySelector("#root");
if (rootElement !== null) {
  createRoot(rootElement).render(
    <StrictMode>
      <AppContextProvider >
        <Theme appearance="dark" accentColor="violet">
          <App />
        </Theme>
      </AppContextProvider>
    </StrictMode>
  );
}
