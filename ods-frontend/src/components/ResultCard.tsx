import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Skeleton } from "../ui/skeleton";
import { Progress } from "../ui/progress";

export interface PredictionResult {
  predictedClass: string;
  confidence: number | null;
  predictionTime: number;
}

export function ResultCard({
  results,
  isLoading,
}: {
  results: PredictionResult[] | null;
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div className="space-y-8">
        <Card className="p-8">
          <Skeleton className="h-8 w-32 mb-4" />
          <Skeleton className="h-12 w-full mb-4" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-6 w-48" />
          </div>
          <div className="mt-6">
            <Progress value={40} />
          </div>
        </Card>
      </div>
    );
  }

  if (!results || results.length === 0) return null;

  return (
    <div className="space-y-8">
      <Card className="p-8">
        <div className="mb-6">
            <div className="text-3xl mb-2" style={{ color: "var(--primary)" }}>
              Resultado ({results.length}):
            </div>
            <p className="text-sm text-muted-foreground">Categoría ODS predicha por párrafo</p>
        </div>
        <div className="space-y-4">
          {results.map((r, idx) => (
            <Card key={idx} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Párrafo {idx + 1}</div>
                  <div className="text-2xl" style={{ color: "var(--primary)" }}>{r.predictedClass}</div>
                </div>
                <div className="flex flex-col items-end">
                  <Badge variant="secondary" className="bg-surface border border-border" style={{ color: "var(--primary)" }}>
                    Confianza {Number.isFinite(r.confidence as number) ? (r.confidence as number)!.toFixed(2) : "—"}
                  </Badge>
                  <Badge variant="outline">t={r.predictionTime}ms</Badge>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Card>
    </div>
  );
}
