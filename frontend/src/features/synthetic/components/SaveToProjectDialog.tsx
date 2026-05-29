// frontend/src/features/synthetic/components/SaveToProjectDialog.tsx

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSyntheticStore } from '../store/syntheticSlice';
import { useCursorPagination } from '@/shared/hooks/useCursorPagination';
import { projectService } from '@/features/projects/services/projectService';
import { datasetService } from '@/features/datasets/services/datasetService';
import { uploadService } from '@/shared/services/s3upload/s3upload.service';
import { dataURLtoFile } from '@/shared/utils/imageUtils';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  FolderKanban,
  Database,
  UploadCloud,
  CheckCircle2,
  Loader2,
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  RefreshCw,
  FileUp,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAppStore } from '@/store/hooks/useAppStore';

type WizardStep = 'project-selection' | 'dataset-selection' | 'uploading' | 'complete';

interface Project {
  id: string;
  name: string;
}

interface Dataset {
  id: string;
  name: string;
}

export default function SaveToProjectDialog() {
  const { showSaveDialog, imagesToSave, closeSaveDialog } = useSyntheticStore();
  const expandPanel = useAppStore((s) => s.expandPanel);

  const [step, setStep] = useState<WizardStep>('project-selection');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [selectedDatasetId, setSelectedDatasetId] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // isMounted guard for memory leak prevention
  const isMountedRef = useRef(true);

  // ---- Paginated Projects ----
  const {
    items: projects,
    loading: isLoadingProjects,
    hasNext: hasMoreProjects,
    loadMore: loadMoreProjects,
    error: projectsError,
    initialLoading: projectsInitialLoading,
  } = useCursorPagination<Project>({
    fetchFn: async (cursor, limit) => {
      const response = await projectService.getAllProjects({ limit, after: cursor });
      const data: Project[] = response?.data || response?.results || response || [];
      return {
        data: Array.isArray(data) ? data : [],
        next_cursor: response?.next_cursor ?? null,
      };
    },
    limit: 10,
    enabled: showSaveDialog,
  });

  // ---- Paginated Datasets ----
  const {
    items: datasets,
    loading: isLoadingDatasets,
    hasNext: hasMoreDatasets,
    loadMore: loadMoreDatasets,
    error: datasetsError,
    reset: resetDatasets,
    initialLoading: datasetsInitialLoading,
  } = useCursorPagination<Dataset>({
    fetchFn: async (cursor, limit) => {
      const response = await datasetService.getAllDatasets(selectedProjectId, { limit, after: cursor });
      const data: Dataset[] = response?.data || response?.results || response || [];
      return {
        data: Array.isArray(data) ? data : [],
        next_cursor: response?.next_cursor ?? null,
      };
    },
    limit: 10,
    enabled: showSaveDialog && !!selectedProjectId,
  });

  // Reset state when dialog opens
  const resetDialog = useCallback(() => {
    setStep('project-selection');
    setSelectedProjectId('');
    setSelectedDatasetId('');
    setIsUploading(false);
    setError(null);
  }, []);

  // Reset datasets when project changes (useCursorPagination handles this via enabled)
  useEffect(() => {
    if (selectedProjectId) {
      resetDatasets();
    }
  }, [selectedProjectId, resetDatasets]);

  // isMounted ref
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Monitor errors from pagination hooks
  useEffect(() => {
    if (projectsError) setError(projectsError);
    else if (datasetsError) setError(datasetsError);
    else setError(null);
  }, [projectsError, datasetsError]);

  const handleNextToDataset = () => {
    if (!selectedProjectId) {
      toast.warning('Lütfen bir proje seçin.');
      return;
    }
    setStep('dataset-selection');
  };

  const handleUpload = async () => {
    if (!imagesToSave.length || !selectedDatasetId) {
      toast.warning('Lütfen bir dataset seçin.');
      return;
    }

    setIsUploading(true);
    setError(null);
    setStep('uploading');

    const count = imagesToSave.length;
    const toastId = toast.loading(
      `${count} görsel yükleme kuyruğuna ekleniyor...`
    );

    try {
      // Her görsel için upload'ı başlat (fire-and-forget)
      for (const [index, image] of imagesToSave.entries()) {
        if (!isMountedRef.current) break;

        const file = dataURLtoFile(image.dataUrl, `synthetic_${image.id}.png`);

        // Upload'ı kuyruğa ekle — bekleme, Upload Manager takip edecek
        await uploadService.addUpload(file, selectedDatasetId, {
          priority: 'HIGH',
          upload_type: 'asset',
        });
      }

      if (!isMountedRef.current) return;

      toast.success(
        count === 1
          ? 'Görsel yükleme kuyruğuna eklendi!'
          : `${count} görsel yükleme kuyruğuna eklendi!`,
        {
          id: toastId,
          duration: 6000,
          action: {
            label: 'Yüklemeleri Takip Et',
            onClick: () => {
              expandPanel();
            },
          },
        }
      );

      setStep('complete');
    } catch (err) {
      if (!isMountedRef.current) return;
      const errMsg = err instanceof Error ? err.message : 'Yükleme başlatılamadı';
      setError(errMsg);
      toast.error(`Hata: ${errMsg}`, { id: toastId });
    } finally {
      if (isMountedRef.current) {
        setIsUploading(false);
      }
    }
  };

  const handleRetry = () => {
    setError(null);
    setStep('dataset-selection');
  };

  const handleClose = () => {
    closeSaveDialog();
    resetDialog();
  };

  // IntersectionObserver instances for infinite scroll
  const projectsObserverRef = useRef<IntersectionObserver | null>(null);
  const datasetsObserverRef = useRef<IntersectionObserver | null>(null);

  // Cleanup observers on unmount
  useEffect(() => {
    return () => {
      if (projectsObserverRef.current) projectsObserverRef.current.disconnect();
      if (datasetsObserverRef.current) datasetsObserverRef.current.disconnect();
    };
  }, []);

  const projectsSentinelRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (projectsObserverRef.current) projectsObserverRef.current.disconnect();
      if (!node || !hasMoreProjects || isLoadingProjects) return;

      projectsObserverRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMoreProjects && !isLoadingProjects) {
            loadMoreProjects();
          }
        },
        { threshold: 0.1 }
      );
      projectsObserverRef.current.observe(node);
    },
    [hasMoreProjects, isLoadingProjects, loadMoreProjects]
  );

  const datasetsSentinelRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (datasetsObserverRef.current) datasetsObserverRef.current.disconnect();
      if (!node || !hasMoreDatasets || isLoadingDatasets) return;

      datasetsObserverRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMoreDatasets && !isLoadingDatasets) {
            loadMoreDatasets();
          }
        },
        { threshold: 0.1 }
      );
      datasetsObserverRef.current.observe(node);
    },
    [hasMoreDatasets, isLoadingDatasets, loadMoreDatasets]
  );

  return (
    <Dialog open={showSaveDialog} onOpenChange={(open) => { if (!open) handleClose(); }}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {step === 'project-selection' && <FolderKanban className="w-5 h-5 text-primary" />}
            {step === 'dataset-selection' && <Database className="w-5 h-5 text-primary" />}
            {step === 'uploading' && <UploadCloud className="w-5 h-5 text-primary" />}
            {step === 'complete' && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
            {imagesToSave.length > 1 ? `${imagesToSave.length} Görseli Kaydet` : 'Görseli Kaydet'}
          </DialogTitle>
          <DialogDescription>
            {step === 'project-selection' && 'Görsellerin kaydedileceği projeyi seçin.'}
            {step === 'dataset-selection' && 'Proje içindeki dataseti seçin.'}
            {step === 'uploading' && 'Görseller S3 yükleme kuyruğuna ekleniyor...'}
            {step === 'complete' && 'Görseller yükleme kuyruğuna eklendi.'}
          </DialogDescription>
        </DialogHeader>

        {/* Step Indicators */}
        <div className="flex items-center gap-2 mb-4">
          {(['project-selection', 'dataset-selection', 'uploading', 'complete'] as WizardStep[]).map(
            (s, i) => {
              const stepIndex = ['project-selection', 'dataset-selection', 'uploading', 'complete'];
              const currentIdx = stepIndex.indexOf(step);
              const isActive = stepIndex.indexOf(s) <= currentIdx;

              return (
                <div key={s} className="flex items-center gap-2 flex-1">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {s === 'complete' ? <CheckCircle2 size={14} /> : i + 1}
                  </div>
                  {i < 3 && (
                    <div
                      className={`flex-1 h-0.5 ${
                        isActive && stepIndex.indexOf(s) < currentIdx
                          ? 'bg-primary'
                          : 'bg-muted'
                      }`}
                      />
                  )}
                </div>
              );
            }
          )}
        </div>

        {/* Toplam seçili görsel bilgisi */}
        {imagesToSave.length > 1 && (step === 'project-selection' || step === 'dataset-selection') && (
          <div className="flex items-center gap-2 px-3 py-2 bg-primary/5 border border-primary/10 rounded-lg text-xs text-primary mb-2">
            <FileUp size={14} />
            <span className="font-medium">{imagesToSave.length} görsel kaydedilecek</span>
          </div>
        )}

        {/* Error State with Retry Button */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-xs mb-3">
            <AlertCircle size={14} className="shrink-0" />
            <span className="flex-1">{error}</span>
            <button
              onClick={handleRetry}
              className="flex items-center gap-1 px-2 py-1 rounded-md bg-destructive/20 hover:bg-destructive/30 text-destructive text-[10px] font-medium transition"
            >
              <RefreshCw size={10} />
              Tekrar Dene
            </button>
          </div>
        )}

        {/* Step 1: Project Selection - Paginated */}
        {step === 'project-selection' && (
          <div className="space-y-3">
            {projectsInitialLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
              </div>
            ) : projects.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">
                Henüz hiç projeniz yok. Önce bir proje oluşturun.
              </p>
            ) : (
              <div
                className="grid gap-2 max-h-[300px] overflow-y-auto"
              >
                {projects.map((project) => (
                  <button
                    key={project.id}
                    onClick={() => setSelectedProjectId(project.id)}
                    className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-all ${
                      selectedProjectId === project.id
                        ? 'border-primary bg-primary/5 ring-1 ring-primary'
                        : 'border-border hover:border-muted-foreground/30 hover:bg-muted/50'
                    }`}
                  >
                    <FolderKanban
                      size={18}
                      className={
                        selectedProjectId === project.id ? 'text-primary' : 'text-muted-foreground'
                      }
                    />
                    <span className="text-sm font-medium">{project.name}</span>
                    {selectedProjectId === project.id && (
                      <CheckCircle2 size={16} className="ml-auto text-primary" />
                    )}
                  </button>
                ))}

                {/* Infinite scroll sentinel */}
                {hasMoreProjects && (
                  <div ref={projectsSentinelRef} className="flex justify-center py-2">
                    <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                  </div>
                )}

                {!hasMoreProjects && projects.length > 0 && (
                  <p className="text-[10px] text-center text-muted-foreground py-1">
                    Tüm projeler yüklendi ({projects.length})
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Step 2: Dataset Selection - Paginated */}
        {step === 'dataset-selection' && (
          <div className="space-y-3">
            {datasetsInitialLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
              </div>
            ) : datasets.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">
                Bu projede henüz dataset yok.
              </p>
            ) : (
              <div
                className="grid gap-2 max-h-[300px] overflow-y-auto"
              >
                {datasets.map((dataset) => (
                  <button
                    key={dataset.id}
                    onClick={() => setSelectedDatasetId(dataset.id)}
                    className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-all ${
                      selectedDatasetId === dataset.id
                        ? 'border-primary bg-primary/5 ring-1 ring-primary'
                        : 'border-border hover:border-muted-foreground/30 hover:bg-muted/50'
                    }`}
                  >
                    <Database
                      size={18}
                      className={
                        selectedDatasetId === dataset.id ? 'text-primary' : 'text-muted-foreground'
                      }
                    />
                    <span className="text-sm font-medium">{dataset.name}</span>
                    {selectedDatasetId === dataset.id && (
                      <CheckCircle2 size={16} className="ml-auto text-primary" />
                    )}
                  </button>
                ))}

                {/* Infinite scroll sentinel */}
                {hasMoreDatasets && (
                  <div ref={datasetsSentinelRef} className="flex justify-center py-2">
                    <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                  </div>
                )}

                {!hasMoreDatasets && datasets.length > 0 && (
                  <p className="text-[10px] text-center text-muted-foreground py-1">
                    Tüm datasetler yüklendi ({datasets.length})
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Step 3: Upload confirmation (queueing, no waiting) */}
        {step === 'uploading' && (
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-center">
              {isUploading ? (
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <p className="text-xs text-muted-foreground">
                    {imagesToSave.length > 1
                      ? `${imagesToSave.length} görsel yükleme kuyruğuna ekleniyor...`
                      : 'Görsel yükleme kuyruğuna ekleniyor...'}
                  </p>
                </div>
              ) : (
                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
              )}
            </div>
            <p className="text-[10px] text-center text-muted-foreground">
              Yükleme arka planda devam edecek. İlerleme durumunu
              <button
                onClick={() => expandPanel()}
                className="text-primary hover:underline mx-1"
              >
                Upload Manager
              </button>
              'dan takip edebilirsiniz.
            </p>
          </div>
        )}

        {/* Step 4: Complete */}
        {step === 'complete' && (
          <div className="py-6 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <p className="text-sm font-medium text-foreground">
              {imagesToSave.length > 1
                ? `${imagesToSave.length} görsel yükleme kuyruğuna eklendi!`
                : 'Görsel yükleme kuyruğuna eklendi!'}
            </p>
            <p className="text-xs text-muted-foreground">
              Görselleriniz S3 depolamaya yükleniyor. Yükleme durumunu
              sağ alt köşedeki Upload Manager'dan takip edebilirsiniz.
            </p>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
          <div>
            {step === 'dataset-selection' && (
              <Button variant="ghost" size="sm" onClick={() => setStep('project-selection')} className="text-xs">
                <ArrowLeft className="w-3 h-3 mr-1" />
                Geri
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleClose} className="text-xs">
              {step === 'complete' ? 'Kapat' : 'İptal'}
            </Button>

            {step === 'project-selection' && (
              <Button
                size="sm"
                onClick={handleNextToDataset}
                disabled={!selectedProjectId}
                className="text-xs"
              >
                İleri
                <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            )}

            {step === 'dataset-selection' && (
              <Button
                size="sm"
                onClick={handleUpload}
                disabled={!selectedDatasetId || isLoadingDatasets}
                className="text-xs"
              >
                <UploadCloud className="w-3 h-3 mr-1" />
                {imagesToSave.length > 1
                  ? `${imagesToSave.length} Görseli S3'e Yükle`
                  : "S3'e Yükle"}
              </Button>
            )}

            {step === 'complete' && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => expandPanel()}
                  className="text-xs"
                >
                  <UploadCloud className="w-3 h-3 mr-1" />
                  Yüklemeleri Takip Et
                </Button>
                <Button size="sm" onClick={handleClose} className="text-xs">
                  Kapat
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}