import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Database, Layers, UserCheck, ImageIcon, CheckCircle } from "lucide-react";

interface DatasetCardProps {
  dataset: {
    id: string;
    name: string;
    description?: string;
    role?: string;
    current_version?: string;
    total_images?: number;
    annotated_images?: number;
  };
}

export const DatasetCard = ({ dataset }: DatasetCardProps) => {
  const { t } = useTranslation(['pages', 'datasets']);

  return (
    <Card className="h-full border border-border bg-card shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden">
      <CardHeader className="space-y-1.5 p-4">
        <div className="flex items-center justify-between">
          <div className="p-2 bg-primary/10 rounded-lg text-primary">
            <Database size={18} />
          </div>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-muted text-muted-foreground border border-border">
            <Layers size={11} /> v{dataset.current_version || "1.0"}
          </span>
        </div>
        <CardTitle className="text-base font-bold text-card-foreground line-clamp-1 mt-2">
          {dataset.name}
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground line-clamp-2 min-h-[2rem]">
          {dataset.description || t("datasets:card.no_description", "No description provided for this repository.")}
        </CardDescription>
      </CardHeader>

      <CardContent className="p-4 pt-2 border-t border-border bg-muted/30 flex flex-col gap-2 text-xs text-muted-foreground mt-auto">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <ImageIcon size={13} className="text-sky-500 shrink-0" />
            <span className="font-bold text-card-foreground">{dataset.total_images ?? 0}</span>
            <span className="text-[10px]">images</span>
          </div>
          <div className="flex items-center gap-1">
            <CheckCircle size={13} className="text-emerald-500 shrink-0" />
            <span className="font-bold text-card-foreground">{dataset.annotated_images ?? 0}</span>
            <span className="text-[10px]">annotated</span>
          </div>
          <div className="ml-auto flex items-center gap-1 font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded">
            <UserCheck size={11} />
            <span className="uppercase text-[10px] tracking-wider">{dataset.role || "OWNER"}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};