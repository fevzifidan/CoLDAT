// src/features/datasets/components/DatasetCard.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Database, Calendar, Layers, UserCheck } from "lucide-react";

interface DatasetCardProps {
  dataset: {
    id: string;
    name: string;
    description?: string;
    dataset_type: string;
    created_at: string;
    role?: string;
  };
}

export const DatasetCard = ({ dataset }: DatasetCardProps) => {
  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("tr-TR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <Card className="h-full border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
      <CardHeader className="space-y-1.5 p-4">
        <div className="flex items-center justify-between">
          <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
            <Database size={18} />
          </div>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-150 text-slate-700 border capitalize">
            <Layers size={12} /> {dataset.dataset_type || "text"}
          </span>
        </div>
        <CardTitle className="text-base font-bold text-slate-800 line-clamp-1 mt-2">
          {dataset.name}
        </CardTitle>
        <CardDescription className="text-xs text-slate-500 line-clamp-2 min-h-[2rem]">
          {dataset.description || "No description provided for this repository."}
        </CardDescription>
      </CardHeader>

      <CardContent className="p-4 pt-0 border-t bg-slate-50/50 flex flex-col gap-2 text-xs text-slate-600 mt-auto rounded-b-xl">
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-1.5 text-slate-500">
            <Calendar size={13} />
            <span>{formatDate(dataset.created_at)}</span>
          </div>
          <div className="flex items-center gap-1 font-medium text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded">
            <UserCheck size={12} />
            <span className="uppercase text-[10px] tracking-wider">{dataset.role || "OWNER"}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};