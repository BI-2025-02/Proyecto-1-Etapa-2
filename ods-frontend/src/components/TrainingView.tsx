import { useState } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Progress } from "../ui/progress";
import { Upload, Play, CheckCircle2, AlertCircle } from "lucide-react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "../ui/table";
import { MetricsGrid } from "./MetricsGrid";
import { postJSON } from "../utils/api";
import { parseTrainingFile } from "../utils/csv";

type TrainingStatus = "idle" | "training" | "success" | "error";

type ClassRow = { clase: string; precision: string; recall: string; f1: string };

export function TrainingView() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<TrainingStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [lastTraining, setLastTraining] = useState("—");

  // métricas globales
  const [precision, setPrecision] = useState<string>("—");
  const [recall, setRecall] = useState<string>("—");
  const [f1, setF1] = useState<string>("—");

  // reporte por clase
  const [classReport, setClassReport] = useState<ClassRow[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] ?? null;
    setFile(selectedFile);
  };

  const handleTrain = async () => {
    if (!file) return;

    setStatus("training");
    setProgress(0);
    setClassReport([]);
    setPrecision("—"); setRecall("—"); setF1("—");

    // animación de progreso simple
    const interval = setInterval(() => {
      setProgress((p) => (p >= 95 ? 95 : p + 7));
    }, 200);

    try {
      // parseTrainingFile devuelve TrainingData[] con {text,label}
      const parsed = await parseTrainingFile(file);
      const textos = parsed.map((r) => r.text);
      const labels = parsed.map((r) => r.label);

      if (!textos.length || !labels.length || textos.length !== labels.length) {
        throw new Error("Archivo inválido: no se extrajeron filas válidas con 'text' y 'label'.");
      }

      // Llamada al backend: /retrain
      // Tu backend puede devolver distintas formas. Cubrimos ambas:
      //  - { mensaje, metrics: {precision_macro, recall_macro, f1_macro}, report: {...por clase...} }
      //  - { mensaje, f1_macro }
  const responseUnknown: unknown = await postJSON("/retrain", { textos, labels });
  const response = (responseUnknown as Record<string, unknown>) ?? {};

      // métricas globales (flexible a distintos nombres)
      // helper to narrow unknown to record
      const asRecord = (v: unknown): Record<string, unknown> | undefined =>
        typeof v === "object" && v !== null ? (v as Record<string, unknown>) : undefined;

      const metrics = asRecord(response)?.metrics ? asRecord(asRecord(response)!.metrics) : undefined;

      const precision_macro =
        (metrics && typeof metrics["precision_macro"] === "number" && (metrics["precision_macro"] as number)) ??
        (typeof asRecord(response)?.["precision_macro"] === "number" ? (asRecord(response)!["precision_macro"] as number) : null);

      const recall_macro =
        (metrics && typeof metrics["recall_macro"] === "number" && (metrics["recall_macro"] as number)) ??
        (typeof asRecord(response)?.["recall_macro"] === "number" ? (asRecord(response)!["recall_macro"] as number) : null);

      const f1_macro =
        (metrics && typeof metrics["f1_macro"] === "number" && (metrics["f1_macro"] as number)) ??
        (typeof asRecord(response)?.["f1_macro"] === "number" ? (asRecord(response)!["f1_macro"] as number) : null);

      if (typeof precision_macro === "number") setPrecision(precision_macro.toFixed(3));
      if (typeof recall_macro === "number") setRecall(recall_macro.toFixed(3));
      if (typeof f1_macro === "number") setF1(f1_macro.toFixed(3));

      // reporte por clase (si viene en response.report con el formato de sklearn)
      // Esperado (output_dict=True):
      // { "No Poverty": {precision, recall, f1-score, support}, "macro avg": {...}, "weighted avg": {...} }
      if (response?.report && typeof response.report === "object") {
        const report = response.report as Record<string, unknown>;
        const rows: ClassRow[] = Object.entries(report)
          .filter(([key]) => key !== "accuracy" && !key.includes("avg")) // solo clases
          .map(([label, metrics]) => {
            const m = metrics as Record<string, unknown> | undefined;
            const precisionVal = m && typeof m.precision === "number" ? m.precision : undefined;
            const recallVal = m && typeof m.recall === "number" ? m.recall : undefined;
            const f1Val = m && typeof m["f1-score"] === "number" ? (m["f1-score"] as number) : undefined;

            return {
              clase: label,
              precision: typeof precisionVal === "number" ? precisionVal.toFixed(2) : "—",
              recall: typeof recallVal === "number" ? recallVal.toFixed(2) : "—",
              f1: typeof f1Val === "number" ? f1Val.toFixed(2) : "—",
            };
          });
        setClassReport(rows);
      } else {
        // fallback: muestra filas de ejemplo si no hubo reporte por clase
        setClassReport([]);
      }

      setStatus("success");
      setLastTraining(new Date().toLocaleString());
      setProgress(100);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      console.error(error);
      setStatus("error");
      setProgress(100);
    } finally {
      clearInterval(interval);
    }
  };

  return (
  <div className="w-full max-w-full px-8 py-8 space-y-8">
      <div>
        <h2 className="mb-6">Cargar CSV</h2>

        <Card className="p-8">
          <div className="border-2 border-dashed border-border rounded-lg p-12 text-center mb-6 bg-surface">
            <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <div className="mb-4">
              <input
                type="file"
                id="file-upload"
                className="hidden"
                accept=".csv"
                onChange={handleFileChange}
              />
              <label htmlFor="file-upload">
                <Button variant="outline" asChild>
                  <span className="cursor-pointer">Seleccionar archivo</span>
                </Button>
              </label>
            </div>
            {file && <div className="text-sm mb-2">Seleccionado: {file.name}</div>}
            <p className="text-sm text-muted-foreground">
              Formato: UTF-8 CSV con columnas <code>text</code>, <code>label</code>
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Último entrenamiento: <span>{lastTraining}</span>
            </div>
            <Button
              onClick={handleTrain}
              disabled={!file || status === "training"}
              className="gap-2"
            >
              <Play className="w-4 h-4" />
              Entrenar modelo
            </Button>
          </div>

          {status === "training" && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm">Entrenamiento en progreso...</span>
                <span className="text-sm">{progress}%</span>
              </div>
              <Progress value={progress} />
            </div>
          )}

          {status === "success" && (
            <div
              className="mt-6 flex items-center gap-2 p-4 rounded-lg"
              style={{ backgroundColor: "rgba(22, 163, 74, 0.1)", color: "var(--success)" }}
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>¡Entrenamiento completado con éxito!</span>
            </div>
          )}

          {status === "error" && (
            <div
              className="mt-6 flex items-center gap-2 p-4 rounded-lg"
              style={{ backgroundColor: "rgba(220, 38, 38, 0.1)", color: "var(--danger)" }}
            >
              <AlertCircle className="w-5 h-5" />
              <span>Error en el entrenamiento. Revise el formato de los datos o el estado del backend.</span>
            </div>
          )}
        </Card>
      </div>

      <div>
        <h2 className="mb-4">Métricas de Entrenamiento</h2>
        {/* Si tu MetricsGrid acepta props, pásalas; si no, deja tu MOCK interno */}
        <MetricsGrid
          values={{
            precision: precision,
            recall: recall,
            f1: f1,
          }}
        />
      </div>

      <div>
        <Card className="p-6">
          <h3 className="mb-4">Reporte por Clase</h3>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Clase</TableHead>
                  <TableHead className="text-right">Precision</TableHead>
                  <TableHead className="text-right">Recall</TableHead>
                  <TableHead className="text-right">F1</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {classReport.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-sm text-muted-foreground">
                      Sin datos por clase (el backend no envió reporte detallado).
                    </TableCell>
                  </TableRow>
                ) : (
                  classReport.map((cls) => (
                    <TableRow key={cls.clase}>
                      <TableCell>{cls.clase}</TableCell>
                      <TableCell className="text-right">{cls.precision}</TableCell>
                      <TableCell className="text-right">{cls.recall}</TableCell>
                      <TableCell className="text-right">{cls.f1}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </div>
  );
}
