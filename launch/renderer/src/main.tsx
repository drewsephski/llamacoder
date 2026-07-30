import React from "react";
import ReactDOM from "react-dom/client";

import { LaunchRenderer } from "./renderer";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <LaunchRenderer />
  </React.StrictMode>,
);
