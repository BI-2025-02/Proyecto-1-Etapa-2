import { Button } from "../ui/button";

interface WelcomeScreenProps {
  onGetStarted: () => void;
}

export function WelcomeScreen({ onGetStarted }: WelcomeScreenProps) {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-8"
      style={{
        background:
          "linear-gradient(to bottom right, var(--bg), var(--surface))",
      }}
    >
      <div className="max-w-2xl text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-6xl">Bienvenido</h1>
          <p className="text-xl text-muted-foreground">
            Clasifique textos y entrene su modelo ODS.
          </p>
        </div>
        <Button onClick={onGetStarted} className="px-8">
          Ir al Predictor
        </Button>
      </div>
    </div>
  );
}
