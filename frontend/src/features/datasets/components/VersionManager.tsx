// frontend/src/features/datasets/components/VersionManager.tsx
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import notificationService from '@/shared/services/notification/notification.service';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  History,
  User,
  FileDown,
  RotateCcw,
  Loader2,
  Layers,
  Tag,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { versionService, type DatasetVersion } from '../services/versionService';
import { usePermission } from '@/context/PermissionContext';

interface VersionManagerProps {
  datasetId?: string;
}

const VersionManager = ({ datasetId }: VersionManagerProps) => {
  const { t } = useTranslation(['pages', 'common', 'datasets']);
  const navigate = useNavigate();

  const [versions, setVersions] = useState<DatasetVersion[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Restore Dialog State
  const [restoreTarget, setRestoreTarget] = useState<DatasetVersion | null>(null);
  const [restoreMode, setRestoreMode] = useState<'create_new' | 'replace'>('create_new');
  const [isRestoring, setIsRestoring] = useState(false);

  const { hasPermission } = usePermission();

  const loadVersions = async () => {
    if (!datasetId) return;
    setIsLoading(true);
    try {
      const res = await versionService.getVersions(datasetId);
      setVersions(res.data || []);
    } catch (err) {
      console.error(err);
      notificationService.error(
        t("datasets:versions.notifications.load_error", "Failed to load version history.")
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadVersions();
  }, [datasetId]);

  const handleRestore = async () => {
    if (!datasetId || !restoreTarget) return;

    if (!hasPermission('version:restore')) {
      notificationService.error(
        t("datasets:versions.notifications.no_permission", "You do not have permission to restore versions.")
      );
      return;
    }

    setIsRestoring(true);
    try {
      await notificationService.promise(
        versionService.restoreVersion(datasetId, restoreTarget.version_tag, {
          mode: restoreMode,
        }),
        {
          loading:
            restoreMode === 'create_new'
              ? t("datasets:versions.notifications.restoring_new", "Creating new version from snapshot...")
              : t("datasets:versions.notifications.restoring_replace", "Replacing dataset state..."),
          success:
            restoreMode === 'create_new'
              ? t("datasets:versions.notifications.restore_new_success", "New version created from snapshot!")
              : t("datasets:versions.notifications.restore_replace_success", "Dataset state replaced successfully!"),
          error: t("datasets:versions.notifications.restore_error", "Version restore failed."),
        }
      );
      setRestoreTarget(null);
      loadVersions();
    } catch (err) {
      console.error(err);
    } finally {
      setIsRestoring(false);
    }
  };

  const handleExportVersion = (versionTag: string) => {
    // Export tab'ına yönlendir ve versiyonu seç
    navigate(`/datasets/${datasetId}?tab=export&version=${versionTag}`);
  };

  // Versiyon listesini oluşturulma zamanına göre sırala (en yeni en üstte)
  const sortedVersions = [...versions].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return (
    <div className="space-y-6">
      {/* Başlık */}
      <div className="text-left space-y-1">
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <History size={16} className="text-primary" />
          {t("datasets:versions.title", "Version History")}
        </h3>
        <p className="text-xs text-muted-foreground">
          {t("datasets:versions.description", "View and manage dataset snapshots")}
        </p>
      </div>

      {/* Versiyon Listesi */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12 font-mono text-xs text-muted-foreground gap-2">
          <Loader2 size={14} className="animate-spin" />
          {t("common:status.loading", "Loading...")}
        </div>
      ) : sortedVersions.length === 0 ? (
        <Card className="rounded-2xl border-border shadow-sm">
          <CardContent className="flex flex-col items-center py-12 text-center">
            <Layers size={24} className="text-muted-foreground/40 mb-3" />
            <p className="text-sm font-medium text-muted-foreground">
              {t("datasets:versions.no_versions", "No versions available yet.")}
            </p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              {t("datasets:versions.no_versions_desc", "Versions are created automatically when a task is approved.")}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {sortedVersions.map((version, index) => {
            const isLatest = index === 0;
            return (
              <Card
                key={version.id}
                className={`rounded-2xl border shadow-sm transition-all hover:shadow-md ${
                  isLatest
                    ? 'border-indigo-200 dark:border-indigo-800 bg-indigo-50/30 dark:bg-indigo-950/10'
                    : 'border-border'
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    {/* Sol taraf - Versiyon bilgisi */}
                    <div className="space-y-2 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm font-mono text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                          <Tag size={13} />
                          {version.version_tag}
                        </span>
                        {isLatest && (
                          <Badge className="text-[9px] uppercase font-bold border bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800">
                            {t("datasets:versions.latest_badge", "Latest")}
                          </Badge>
                        )}
                        {version.description && (
                          <span className="text-xs text-muted-foreground truncate max-w-[300px]">
                            {version.description}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <User size={11} />
                          {version.created_by_username || 'System'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={11} />
                          {new Date(version.created_at).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Sağ taraf - Actions */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 text-xs gap-1.5 rounded-xl"
                        onClick={() => handleExportVersion(version.version_tag)}
                      >
                        <FileDown size={13} />
                        {t("datasets:versions.actions.export", "Export")}
                      </Button>
                      {hasPermission('version:restore') && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 text-xs gap-1.5 rounded-xl"
                          onClick={() => {
                            setRestoreTarget(version);
                            setRestoreMode('create_new');
                          }}
                        >
                          <RotateCcw size={13} />
                          {t("datasets:versions.actions.restore", "Restore")}
                        </Button>
                      )};
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Restore Dialog */}
      <Dialog open={!!restoreTarget} onOpenChange={(open) => !open && setRestoreTarget(null)}>
        <DialogContent className="sm:max-w-[425px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RotateCcw size={16} />
              {t("datasets:versions.restore_dialog.title", "Restore Version")}
            </DialogTitle>
            <DialogDescription>
              {t("datasets:versions.restore_dialog.description", "Restore dataset state from")}{" "}
              <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                {restoreTarget?.version_tag}
              </span>
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <RadioGroup value={restoreMode} onValueChange={(v) => setRestoreMode(v as 'create_new' | 'replace')}>
              <div className="flex items-start space-x-3 space-y-0 p-3 rounded-xl border border-border hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="create_new" id="create_new" className="mt-0.5" />
                <div>
                  <Label htmlFor="create_new" className="font-bold text-sm cursor-pointer">
                    {t("datasets:versions.restore_dialog.create_new", "Create as new version")}
                  </Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {t("datasets:versions.restore_dialog.create_new_desc", "Creates a new version from the snapshot. Current dataset state is preserved.")}
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3 space-y-0 p-3 rounded-xl border border-border hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="replace" id="replace" className="mt-0.5" />
                <div>
                  <Label htmlFor="replace" className="font-bold text-sm cursor-pointer">
                    {t("datasets:versions.restore_dialog.replace", "Replace current state")}
                  </Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {t("datasets:versions.restore_dialog.replace_desc", "Replaces the current dataset assets and annotations with the snapshot. Current state will be lost.")}
                  </p>
                </div>
              </div>
            </RadioGroup>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl"
              onClick={() => setRestoreTarget(null)}
            >
              {t("common:actions.cancel", "Cancel")}
            </Button>
            <Button
              size="sm"
              className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white"
              onClick={handleRestore}
              disabled={isRestoring}
            >
              {isRestoring ? (
                <>
                  <Loader2 size={13} className="mr-1 animate-spin" />
                  {t("common:status.loading", "Restoring...")}
                </>
              ) : (
                <>
                  <RotateCcw size={13} className="mr-1" />
                  {t("datasets:versions.restore_dialog.confirm", "Restore")}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VersionManager;
