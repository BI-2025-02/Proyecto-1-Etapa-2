import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import { Button } from "../ui/button";


interface Props {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isDark: boolean;
  onToggleTheme: () => void;
}

export function TopBar({ activeTab, onTabChange, isDark, onToggleTheme }: Props) {
  return (
    <div className="sticky top-0 z-50 bg-surface border-b border-border shadow-sm">
  <div className="w-full max-w-full px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center text-white font-bold">
            ODS
          </div>
          <h2>ODS Classifier</h2>
        </div>
        <div className="flex items-center gap-4">
          <Tabs value={activeTab} onValueChange={onTabChange}>
            <TabsList className="flex items-center">
              <TabsTrigger value="predictor">Predictor</TabsTrigger>
              <TabsTrigger value="training">Entrenamiento</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button variant="ghost" onClick={onToggleTheme}>
            {isDark ? "☀️" : "🌙"}
          </Button>
        </div>
      </div>
    </div>
  );
}
