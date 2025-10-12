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
  result,
  isLoading,
}: {
  result: PredictionResult | null;
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

  if (!result) return null;

  return (
    <div className="space-y-8">
      <Card className="p-8">
        <div className="mb-6">
          <div className="text-3xl mb-2" style={{ color: "var(--primary)" }}>
            {result.predictedClass}
          </div>
          <p className="text-sm text-muted-foreground">Categoría ODS predicha</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="bg-surface border border-border" style={{ color: "var(--primary)" }}>
            Confianza {Number.isFinite(result.confidence) ? result.confidence!.toFixed(2) : "—"}
          </Badge>
          <Badge variant="outline">t={result.predictionTime}ms</Badge>
        </div>
      </Card>
    </div>
  );
}
