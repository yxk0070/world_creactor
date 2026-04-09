import React, { createContext, useContext, useState, ReactNode } from "react";

interface ScenarioContextType {
  scenario: string;
  setScenario: (scenario: string) => void;
}

const ScenarioContext = createContext<ScenarioContextType | undefined>(
  undefined,
);

export function ScenarioProvider({ children }: { children: ReactNode }) {
  const [scenario, setScenario] = useState<string>("小说");

  return (
    <ScenarioContext.Provider value={{ scenario, setScenario }}>
      {children}
    </ScenarioContext.Provider>
  );
}

export function useScenario() {
  const context = useContext(ScenarioContext);
  if (context === undefined) {
    throw new Error("useScenario must be used within a ScenarioProvider");
  }
  return context;
}
