import { FileQuestion } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description?: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center mb-4">
        <FileQuestion className="w-12 h-12 text-slate-400" />
      </div>
      <p className="text-slate-600">{title}</p>
      {description && <p className="text-sm text-slate-500 mt-2">{description}</p>}
    </div>
  );
}