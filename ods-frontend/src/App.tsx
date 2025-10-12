import { useEffect, useState } from "react";
import { TopBar } from "./components/TopBar.tsx";
import { WelcomeScreen } from "./components/WelcomeScreen";
import { PredictorView } from "./components/PredictorView";
import { TrainingView } from "./components/TrainingView";
import "./styles/global.css";

export type View = "welcome" | "predictor" | "training";

export default function App() {
  const [currentView, setCurrentView] = useState<View>("welcome");
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  if (currentView === "welcome") {
    return <WelcomeScreen onGetStarted={() => setCurrentView("predictor")} />;
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--bg)" }}>
      <TopBar
        activeTab={currentView}
        onTabChange={(tab) => setCurrentView(tab as View)}
        isDark={isDark}
        onToggleTheme={() => setIsDark(!isDark)}
      />
      {currentView === "predictor" && <PredictorView />}
      {currentView === "training" && <TrainingView />}
    </div>
  );
}

