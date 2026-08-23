import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App";
import AppProviders from "./context/AppProviders";
import "./styles/tokens.css";
import "./styles/typography.css";
import "./styles/globals.css";
import "./styles/responsive.css";
import "./styles/components.css";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AppProviders>
        <App />
      </AppProviders>
    </BrowserRouter>
  </StrictMode>,
);
