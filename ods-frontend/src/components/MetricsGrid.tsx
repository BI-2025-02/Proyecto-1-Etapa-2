import { Card } from "../ui/card";
import { Activity, TrendingUp, Award } from "lucide-react";

interface Metric {
  label: string;
  value: string;
  icon: React.ReactNode;
}

interface MetricsGridProps {
  values?: {
    precision?: string;
    recall?: string;
    f1?: string;
  };
}

export function MetricsGrid({ values }: MetricsGridProps) {
  const metrics: Metric[] = [
    {
      label: "Precision (macro)",
      value: values?.precision ?? "—",
      icon: <Activity className="w-5 h-5 text-muted-foreground" />,
    },
    {
      label: "Recall (macro)",
      value: values?.recall ?? "—",
      icon: <TrendingUp className="w-5 h-5 text-muted-foreground" />,
    },
    {
      label: "F1 (macro)",
      value: values?.f1 ?? "—",
      icon: <Award className="w-5 h-5 text-muted-foreground" />,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {metrics.map((metric) => (
        <Card
          key={metric.label}
          className="p-6 flex flex-col items-start justify-center"
        >
          <div className="flex items-center gap-3 mb-2 text-muted-foreground">
            {metric.icon}
            <span className="text-sm">{metric.label}</span>
          </div>
          <div className="text-2xl font-semibold">{metric.value}</div>
        </Card>
      ))}
    </div>
  );
}
