import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { App } from "./App";
import { TaskProvider } from "./contexts/TaskContext";
import { ScenarioProvider } from "./contexts/ScenarioContext";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ScenarioProvider>
        <TaskProvider>
          <App />
        </TaskProvider>
      </ScenarioProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
