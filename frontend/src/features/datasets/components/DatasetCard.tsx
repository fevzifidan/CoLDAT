export const DatasetCard = ({ dataset }: DatasetCardProps) => {
  const { t } = useTranslation(['pages', 'datasets']);

  return (
    <Card className="h-full border border-border bg-card shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden">
      <CardHeader className="space-y-1.5 p-4">
        <div className="flex items-center justify-between">
          <div className="p-2 bg-primary/10 rounded-lg text-primary">
            <Database size={18} />
          </div>
        </div>
        <CardTitle className="text-base font-bold text-card-foreground line-clamp-1 mt-2">
          {dataset.name}
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground line-clamp-2 min-h-[2rem]">
          {dataset.description || t("datasets:card.no_description", "No description provided for this repository.")}
        </CardDescription>
      </CardHeader>

      <CardContent className="p-4 pt-2 border-t border-border bg-muted/30 flex flex-col gap-2 text-xs text-muted-foreground mt-auto">
        <div className="flex items-center justify-between mt-1">
          <div className="flex items-center gap-1 font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded">
            <UserCheck size={12} />
            <span className="uppercase text-[10px] tracking-wider">{dataset.role || "OWNER"}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};