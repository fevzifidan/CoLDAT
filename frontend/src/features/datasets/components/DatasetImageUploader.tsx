// frontend/src/features/datasets/components/DatasetImageUploader.tsx
import { useState, useCallback, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Upload,
  X,
  FileImage,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ImagePlus,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { uploadService } from '@/shared/services/s3upload';
import { useDatasetUploads } from '../hooks/useDatasetUploads';
import type { UploadTask } from '@/shared/services/s3upload/types';

interface DatasetImageUploaderProps {
  datasetId: string;
  currentUserRole?: string;
  onUploadComplete?: () => void;
}

/** Kabul edilen MIME türleri */
const ACCEPTED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/bmp',
  'image/tiff',
];

/** Maksimum dosya boyutu: 50MB */
const MAX_FILE_SIZE = 50 * 1024 * 1024;

interface SelectedFile {
  id: string;
  file: File;
  previewUrl: string;
}

const DatasetImageUploader: React.FC<DatasetImageUploaderProps> = ({
  datasetId,
  currentUserRole,
  onUploadComplete,
}) => {
  const { t } = useTranslation(['datasets', 'common']);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Bu dataset'e ait upload task'lerini dinle
  const uploadTasks = useDatasetUploads(datasetId);

  // Upload'ın görünür olduğu durumlar (admin veya annotator)
  const canUpload =
    currentUserRole?.toLowerCase() === 'admin' ||
    currentUserRole?.toLowerCase() === 'annotator';

  // Seçili dosyalardan hangileri terminal durumda (başarılı/başarısız)
  const completedUploadIds = new Set(
    uploadTasks
      .filter((t) => t.status === 'SUCCESS' || t.status === 'FAILED' || t.status === 'CANCELLED')
      .map((t) => t.upload_id)
  );

  // Tüm upload'lar başarılı olduğunda parent'ı bilgilendir ve seçimleri temizle
  const allSelectedUploaded =
    selectedFiles.length > 0 &&
    selectedFiles.every((sf) => {
      const task = uploadTasks.find((t) => t.upload_id === sf.id);
      return task?.status === 'SUCCESS';
    });

  useEffect(() => {
    if (allSelectedUploaded) {
      // Biraz gecikmeli temizle (kullanıcı "SUCCESS" badge'ini görebilsin)
      const timer = setTimeout(() => {
        setSelectedFiles([]);
        // Preview URL'leri temizle
        selectedFiles.forEach((sf) => URL.revokeObjectURL(sf.previewUrl));
        onUploadComplete?.();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [allSelectedUploaded]);

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      selectedFiles.forEach((sf) => URL.revokeObjectURL(sf.previewUrl));
    };
  }, []);

  const validateFiles = (files: File[]): { valid: File[]; errors: string[] } => {
    const valid: File[] = [];
    const errors: string[] = [];

    files.forEach((file) => {
      if (!ACCEPTED_MIME_TYPES.includes(file.type)) {
        errors.push(
          t('datasets:uploader.errors.invalid_type', {
            filename: file.name,
            defaultValue: `"${file.name}" is not a supported image format.`,
          })
        );
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        errors.push(
          t('datasets:uploader.errors.file_too_large', {
            filename: file.name,
            defaultValue: `"${file.name}" exceeds the 50MB size limit.`,
          })
        );
        return;
      }
      valid.push(file);
    });

    return { valid, errors };
  };

  const addFiles = useCallback(
    (files: File[]) => {
      const { valid, errors } = validateFiles(files);
      setValidationErrors(errors);

      if (valid.length === 0) return;

      const newSelections: SelectedFile[] = valid.map((file) => ({
        id: crypto.randomUUID(),
        file,
        previewUrl: URL.createObjectURL(file),
      }));

      setSelectedFiles((prev) => [...prev, ...newSelections]);
    },
    [t]
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) addFiles(files);
    // Reset input so same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) addFiles(files);
  };

  const removeFile = (fileId: string) => {
    setSelectedFiles((prev) => {
      const file = prev.find((f) => f.id === fileId);
      if (file) URL.revokeObjectURL(file.previewUrl);
      return prev.filter((f) => f.id !== fileId);
    });
  };

  const handleUploadAll = async () => {
    if (selectedFiles.length === 0) return;

    for (const sf of selectedFiles) {
      // Daha önce eklenmişse atla
      const existing = uploadTasks.find((t) => t.upload_id === sf.id);
      if (existing && !['FAILED', 'CANCELLED'].includes(existing.status)) continue;

      await uploadService.addUpload(sf.file, datasetId, {
        priority: 'HIGH',
        upload_type: 'asset',
        hidden: true,
      });
    }
  };

  // Bir task'in status bilgisini seçili dosyayla eşleştir
  const getTaskForFile = (fileId: string): UploadTask | undefined => {
    return uploadTasks.find((t) => t.upload_id === fileId);
  };

  const getStatusDisplay = (task?: UploadTask) => {
    if (!task) return null;

    switch (task.status) {
      case 'PREPROCESSING':
      case 'HASHING':
      case 'REQUESTING_URL':
        return (
          <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
            <Loader2 size={14} className="animate-spin" />
            <span className="text-xs font-medium">
              {t('datasets:uploader.status.preparing', 'Preparing...')}
            </span>
          </div>
        );
      case 'UPLOADING':
        return (
          <div className="flex items-center gap-2 w-full">
            <div className="flex-1 bg-muted rounded-full h-1.5 overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-300"
                style={{ width: `${task.progress}%` }}
              />
            </div>
            <span className="text-xs font-mono text-muted-foreground min-w-[3ch] text-right">
              {task.progress}%
            </span>
          </div>
        );
      case 'SUCCESS':
        return (
          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 size={14} />
            <span className="text-xs font-medium">
              {t('datasets:uploader.status.success', 'Uploaded')}
            </span>
          </div>
        );
      case 'FAILED':
        return (
          <div className="flex items-center gap-1.5 text-destructive">
            <AlertCircle size={14} />
            <span className="text-xs font-medium">
              {t('datasets:uploader.status.failed', 'Failed')}
            </span>
          </div>
        );
      case 'CANCELLED':
        return (
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <X size={14} />
            <span className="text-xs font-medium">
              {t('datasets:uploader.status.cancelled', 'Cancelled')}
            </span>
          </div>
        );
      default:
        return (
          <span className="text-xs text-muted-foreground">
            {t('datasets:uploader.status.waiting', 'Waiting...')}
          </span>
        );
    }
  };

  const hasActiveUploads = uploadTasks.some((t) =>
    ['IDLE', 'PREPROCESSING', 'HASHING', 'REQUESTING_URL', 'UPLOADING'].includes(t.status)
  );

  // Retry failed upload
  const handleRetry = async (uploadId: string) => {
    await uploadService.retryUpload(uploadId);
  };

  return (
    <Card className="shadow-sm border-border">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-bold">
          <ImagePlus size={18} className="text-primary" />
          {t('datasets:uploader.title', 'Upload Images')}
        </CardTitle>
        <CardDescription className="text-sm">
          {t(
            'datasets:uploader.description',
            'Select or drag and drop images to add them to this dataset.'
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <div className="p-3 rounded-xl border border-destructive/20 bg-destructive/5 space-y-1">
            {validationErrors.map((err, i) => (
              <p key={i} className="text-xs text-destructive flex items-start gap-1.5">
                <AlertCircle size={12} className="mt-0.5 shrink-0" />
                {err}
              </p>
            ))}
            <Button
              size="sm"
              variant="ghost"
              className="h-6 text-xs mt-1"
              onClick={() => setValidationErrors([])}
            >
              {t('common:actions.dismiss', 'Dismiss')}
            </Button>
          </div>
        )}

        {/* Drop Zone */}
        {canUpload && (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`
              relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer
              transition-all duration-200 group
              ${
                isDragOver
                  ? 'border-primary bg-primary/5 scale-[1.02]'
                  : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30'
              }
            `}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={ACCEPTED_MIME_TYPES.join(',')}
              className="hidden"
              onChange={handleFileSelect}
            />
            <div className="flex flex-col items-center gap-2 pointer-events-none">
              <div
                className={`
                  p-3 rounded-full transition-colors
                  ${isDragOver ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}
                `}
              >
                <Upload size={24} className={isDragOver ? 'animate-bounce' : ''} />
              </div>
              <p className="text-sm font-medium text-foreground">
                {isDragOver
                  ? t('datasets:uploader.drop_here', 'Drop images here')
                  : t('datasets:uploader.drag_hint', 'Drag & drop images here, or click to browse')}
              </p>
              <p className="text-xs text-muted-foreground">
                {t(
                  'datasets:uploader.formats_hint',
                  'Supports: JPEG, PNG, WebP, BMP, TIFF (max 50MB each)'
                )}
              </p>
            </div>
          </div>
        )}

        {/* Selected Files List */}
        {selectedFiles.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-foreground">
                {t('datasets:uploader.selected_files', {
                  count: selectedFiles.length,
                  defaultValue: `{{count}} file(s) selected`,
                })}
              </h4>
              {!hasActiveUploads && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 text-xs text-muted-foreground hover:text-destructive"
                  onClick={() => {
                    selectedFiles.forEach((sf) => URL.revokeObjectURL(sf.previewUrl));
                    setSelectedFiles([]);
                  }}
                >
                  <Trash2 size={12} className="mr-1" />
                  {t('common:actions.clear_all', 'Clear All')}
                </Button>
              )}
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {selectedFiles.map((sf) => {
                const task = getTaskForFile(sf.id);
                return (
                  <div
                    key={sf.id}
                    className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card hover:bg-muted/50 transition-colors"
                  >
                    {/* Thumbnail */}
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted shrink-0 border border-border">
                      <img
                        src={sf.previewUrl}
                        alt={sf.file.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>

                    {/* File Info */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <p className="text-sm font-medium truncate text-foreground">
                        {sf.file.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {(sf.file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>

                    {/* Status / Progress */}
                    <div className="min-w-[120px] flex items-center justify-end">
                      {getStatusDisplay(task)}
                    </div>

                    {/* Remove Button (only if not actively uploading) */}
                    {(!task || ['FAILED', 'CANCELLED', 'IDLE'].includes(task.status)) && (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
                        onClick={() => removeFile(sf.id)}
                      >
                        <X size={14} />
                      </Button>
                    )}

                    {/* Retry Button (if failed) */}
                    {task?.status === 'FAILED' && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs shrink-0"
                        onClick={() => handleRetry(task.upload_id)}
                      >
                        <AlertCircle size={12} className="mr-1" />
                        {t('common:actions.retry', 'Retry')}
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Upload All Button */}
            {canUpload && !allSelectedUploaded && (
              <Button
                onClick={handleUploadAll}
                disabled={hasActiveUploads || selectedFiles.length === 0}
                className="w-full gap-2"
              >
                {hasActiveUploads ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Upload size={16} />
                )}
                {hasActiveUploads
                  ? t('datasets:uploader.uploading', 'Uploading...')
                  : t('datasets:uploader.upload_button', {
                      count: selectedFiles.length,
                      defaultValue: `Upload {{count}} file(s) to Dataset`,
                    })}
              </Button>
            )}

            {/* All Uploaded Success Message */}
            {allSelectedUploaded && (
              <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/30 text-center">
                <CheckCircle2 size={24} className="mx-auto text-emerald-500 mb-1" />
                <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                  {t(
                    'datasets:uploader.all_uploaded',
                    'All files uploaded successfully!'
                  )}
                </p>
              </div>
            )}
          </div>
        )}

        {/* No permission warning */}
        {!canUpload && (
          <div className="p-4 rounded-xl border border-muted bg-muted/30 text-center">
            <p className="text-sm text-muted-foreground">
              {t(
                'datasets:uploader.no_permission',
                'You do not have permission to upload images to this dataset.'
              )}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DatasetImageUploader;
