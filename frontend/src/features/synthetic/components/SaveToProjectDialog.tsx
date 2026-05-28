// frontend/src/features/synthetic/components/SaveToProjectDialog.tsx

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSyntheticStore } from '../store/syntheticSlice';
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
  X,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';

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
  const { showSaveDialog, imageToSave, closeSaveDialog } = useSyntheticStore();

  const [step, setStep] = useState<WizardStep>('project-selection');
  const [projects, setProjects] = useState<Project[]>([]);
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [selectedDatasetId, setSelectedDatasetId] = useState<string>('');
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [isLoadingDatasets, setIsLoadingDatasets] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // For real progress tracking from uploadService
  const unsubscribeRef = useRef<(() => void) | null>(null);

  // Reset state when dialog opens
  const resetDialog = useCallback(() => {
    setStep('project-selection');
    setSelectedProjectId('');
    setSelectedDatasetId('');
    setIsUploading(false);
    setUploadProgress(0);
    setError(null);
  }, []);

  // Load projects when dialog opens
  useEffect(() => {
    if (!showSaveDialog) {
      resetDialog();
      return;
    }

    const loadProjects = async () => {
      setIsLoadingProjects(true);
      setError(null);
      try {
        const response = await projectService.getAllProjects();
        const projectList: Project[] = response?.results || response?.data || response || [];
        setProjects(Array.isArray(projectList) ? projectList : []);
      } catch (err) {
        console.error('Failed to load projects:', err);
        setError('Projeler yüklenirken hata oluştu.');
        setProjects([]);
      } finally {
        setIsLoadingProjects(false);
      }
    };

    loadProjects();
  }, [showSaveDialog, resetDialog]);

  // Load datasets when project is selected
  useEffect(() => {
    if (!selectedProjectId) {
      setDatasets([]);
      setSelectedDatasetId('');
      return;
    }

    const loadDatasets = async () => {
      setIsLoadingDatasets(true);
      setError(null);
      try {
        const response = await datasetService.getAllDatasets(selectedProjectId);
        const datasetList: Dataset[] = response?.results || response?.data || response || [];
        setDatasets(Array.isArray(datasetList) ? datasetList : []);
        setSelectedDatasetId('');
      } catch (err) {
        console.error('Failed to load datasets:', err);
        setError('Datasetler yüklenirken hata oluştu.');
        setDatasets([]);
      } finally {
        setIsLoadingDatasets(false);
      }
    };

    loadDatasets();
  }, [selectedProjectId]);

  // Cleanup subscription on unmount
  useEffect(() => {
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, []);

  const handleNextToDataset = () => {
    if (!selectedProjectId) {
      toast.warning('Lütfen bir proje seçin.');
      return;
    }
    setStep('dataset-selection');
  };

  const handleUpload = async () => {
    if (!imageToSave || !selectedDatasetId) {
      toast.warning('Lütfen bir dataset seçin.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setError(null);
    setStep('uploading');

    const toastId = toast.loading('Görsel S3\'e yükleniyor...');

    try {
      // Convert base64 to File
      const file = dataURLtoFile(imageToSave.dataUrl, `synthetic_${imageToSave.id}.png`);

      // Subscribe to real upload progress
      unsubscribeRef.current = uploadService.subscribe((tasks) => {
        tasks.forEach((task) => {
          if (task.status === 'UPLOADING' && task.progress) {
            setUploadProgress(task.progress);
          } else if (task.status === 'SUCCESS') {
            setUploadProgress(100);
          }
        });
      });

      // Use the existing uploadService
      await uploadService.addUpload(file, selectedDatasetId, {
        priority: 'HIGH',
        upload_type: 'asset',
      });

      // Unsubscribe from progress tracking
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }

      setUploadProgress(100);
      toast.success('Görsel başarıyla kaydedildi!', { id: toastId });
      setStep('complete');
    } catch (err) {
      // Unsubscribe on error too
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }

      const errMsg = err instanceof Error ? err.message : 'Yükleme hatası';
      setError(errMsg);
      toast.error(`Yükleme başarısız: ${errMsg}`, { id: toastId });
    } finally {
      setIsUploading(false);
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

  return (
    <Dialog open={showSaveDialog} onOpenChange={(open) => { if (!open) handleClose(); }}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {step === 'project-selection' && <FolderKanban className="w-5 h-5 text-primary" />}
            {step === 'dataset-selection' && <Database className="w-5 h-5 text-primary" />}
            {step === 'uploading' && <UploadCloud className="w-5 h-5 text-primary" />}
            {step === 'complete' && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
            Görseli Kaydet
          </DialogTitle>
          <DialogDescription>
            {step === 'project-selection' && 'Görselin kaydedileceği projeyi seçin.'}
            {step === 'dataset-selection' && 'Proje içindeki dataseti seçin.'}
            {step === 'uploading' && 'Görsel S3\'e yükleniyor...'}
            {step === 'complete' && 'Görsel başarıyla kaydedildi.'}
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

        {/* Step 1: Project Selection */}
        {step === 'project-selection' && (
          <div className="space-y-3">
            {isLoadingProjects ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
              </div>
            ) : projects.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">
                Henüz hiç projeniz yok. Önce bir proje oluşturun.
              </p>
            ) : (
              <div className="grid gap-2 max-h-[300px] overflow-y-auto">
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
              </div>
            )}
          </div>
        )}

        {/* Step 2: Dataset Selection */}
        {step === 'dataset-selection' && (
          <div className="space-y-3">
            {isLoadingDatasets ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
              </div>
            ) : datasets.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">
                Bu projede henüz dataset yok.
              </p>
            ) : (
              <div className="grid gap-2 max-h-[300px] overflow-y-auto">
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
              </div>
            )}
          </div>
        )}

        {/* Step 3: Uploading - Real Progress */}
        {step === 'uploading' && (
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-center">
              {isUploading ? (
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              ) : (
                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
              )}
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Yükleniyor...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
            <p className="text-[10px] text-center text-muted-foreground">
              S3 depolamaya doğrudan yükleniyor...
            </p>
          </div>
        )}

        {/* Step 4: Complete */}
        {step === 'complete' && (
          <div className="py-6 text-center space-y-2">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <p className="text-sm font-medium text-foreground">Görsel başarıyla kaydedildi!</p>
            <p className="text-xs text-muted-foreground">
              Görseliniz S3 depolamaya yüklendi ve dataset'e eklendi.
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
              İptal
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
                S3'e Yükle
              </Button>
            )}

            {step === 'complete' && (
              <Button size="sm" onClick={handleClose} className="text-xs">
                Kapat
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
