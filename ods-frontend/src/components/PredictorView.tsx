import { useState } from "react";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Card } from "../ui/card";
import { EmptyState } from "./EmptyState";
import { ResultCard } from "./ResultCard";
import { postJSON, type PredictPayload, type PredictResponse } from "../utils/api";
import { splitTextsByParagraphs } from "../utils/textSplitter";

type UiResult = {
  predictedClass: string;
  confidence: number | null;
  predictionTime: number;
};

export function PredictorView() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<UiResult[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const charCount = text.length;
  const canPredict = charCount >= 10 && !isLoading;

  async function handlePredict() {
    setIsLoading(true);
    setErr(null);
    setResult(null);
    const t0 = performance.now();

    try {
      const textos = splitTextsByParagraphs(text);
      if (textos.length === 0) {
        throw new Error("No hay textos para clasificar.");
      }

      const payload: PredictPayload = { textos };
      const data = await postJSON<PredictResponse>("/predict", payload);

      const preds = Array.isArray(data.predicciones) ? data.predicciones : [data.predicciones];
      const probs = Array.isArray(data.probabilidades) ? data.probabilidades : undefined;
      const timeSpent = Math.round(performance.now() - t0);

      const uiResults: UiResult[] = preds.map((p, i) => ({
        predictedClass: String(p ?? ""),
        confidence: typeof probs?.[i] === "number" ? probs![i] : null,
        predictionTime: timeSpent,
      }));

      setResult(uiResults);
    } catch (e: unknown) {
      if (e instanceof Error) {
        setErr(e.message);
      } else {
        setErr("No se pudo predecir");
      }
    } finally {
      setIsLoading(false);
    }
  }

  function handleClear() {
    setText("");
    setResult(null);
    setErr(null);
  }

  return (
  <div className="w-full max-w-full px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Izquierda (60%) */}
        <div className="lg:col-span-3 space-y-6">
          <div>
            <h2 className="mb-6">Ingrese el texto</h2>

            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Pegue aquí el texto a clasificar…"
              className="min-h-[300px] resize-none"
            />

            <div className="flex items-center justify-between mt-2">
              <div className="text-sm text-muted-foreground">{charCount} caracteres</div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handlePredict}
              disabled={!canPredict}
              className="flex-1"
            >
              {isLoading ? "Prediciendo…" : "Predecir"}
            </Button>

            <Button
              onClick={handleClear}
              variant="outline"
              disabled={!text && !result}
            >
              Limpiar
            </Button>
          </div>

          {err && (
            <Card className="p-4 text-sm" style={{ color: "#b91c1c", background: "rgba(220,38,38,.08)" }}>
              {err}
            </Card>
          )}
        </div>

        {/* Derecha (40%) */}
        <div className="lg:col-span-2">
          {!result && !isLoading ? (
            <Card className="p-8">
              <EmptyState
                title="Sin resultados"
                description="Ingrese texto y haga clic en Predecir para ver los resultados"
              />
            </Card>
          ) : (
            <ResultCard results={result} isLoading={isLoading} />
          )}
        </div>
      </div>
    </div>
  );
}
