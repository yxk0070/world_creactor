import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { App } from "./App";
import { TaskProvider } from "./contexts/TaskContext";
import { ScenarioProvider } from "./contexts/ScenarioContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import "./theme.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <ScenarioProvider>
          <TaskProvider>
            <App />
          </TaskProvider>
        </ScenarioProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
