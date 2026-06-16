// src/features/datasets/DatasetDetailPage.tsx
import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  ArrowLeft,
  Database,
  Layers,
  ImageIcon,
  CheckCircle,
  UserCheck,
  Loader2,
  AlertCircle,
  Trash2,
} from 'lucide-react';
import { datasetService } from './services/datasetService';
import DatasetMemberManager from './components/DatasetMemberManager';
import DatasetImageUploader from './components/DatasetImageUploader';
import DatasetImageGallery from './components/DatasetImageGallery';

interface DatasetDetail {
  id: string;
  project_id: string;
  name: string;
  description?: string;
  current_version?: string;
  total_images?: number;
  annotated_images?: number;
  role?: string;
}

const DatasetDetailPage = () => {
  const { datasetId } = useParams<{ datasetId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation(['pages', 'common', 'datasets']);

  const [dataset, setDataset] = useState<DatasetDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Refresh key — her upload/görsel değişiminde artırılarak galeri ve istatistiklerin yenilenmesi sağlanır
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchDataset = useCallback(() => {
    if (!datasetId) return;

    setLoading(true);
    setError(null);

    datasetService
      .getDatasetById(datasetId)
      .then((response: any) => {
        // response doğrudan dataset objesi veya { data: ... } wrapper içinde gelebilir
        const data = response?.data || response;
        if (data && data.id) {
          setDataset(data);
        } else {
          setError(t('common:status.not_found', 'Dataset not found.'));
        }
      })
      .catch((err: any) => {
        console.error('Dataset detail error:', err);
        if (err?.response?.status === 404) {
          setError(t('common:status.not_found', 'Dataset not found.'));
        } else {
          setError(
            err?.response?.data?.message ||
            t('common:status.error', 'An error occurred while loading dataset details.')
          );
        }
      })
      .finally(() => setLoading(false));
  }, [datasetId, t]);

  useEffect(() => {
    fetchDataset();
  }, [fetchDataset, refreshKey]);

  const handleImagesChanged = useCallback(() => {
    // İstatistikleri ve galeriyi yenile
    setRefreshKey((prev) => prev + 1);
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center font-mono text-muted-foreground min-h-screen">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <p className="text-sm">{t('common:status.loading', 'Loading...')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-64 items-center justify-center min-h-screen p-4">
        <div className="p-6 rounded-2xl border border-destructive/20 bg-destructive/5 text-center space-y-3 max-w-sm shadow-sm">
          <AlertCircle size={28} className="mx-auto text-destructive" />
          <p className="text-sm text-destructive font-medium">{error}</p>
          <Button size="sm" variant="outline" onClick={() => navigate('/datasets')}>
            {t('pages:datasets.back_to_list', 'Back to Datasets')}
          </Button>
        </div>
      </div>
    );
  }

  if (!dataset) {
    return null;
  }

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-4 border-border">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/datasets')}
            className="rounded-xl border border-border h-9 w-9"
          >
            <ArrowLeft size={16} />
          </Button>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground">{dataset.name}</h1>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold">
              {t('datasets:detail.subtitle', 'Dataset Overview')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {dataset.role?.toLowerCase() === 'admin' && (
            <Button
              variant="outline"
              size="sm"
              className="text-destructive border-destructive/30 hover:bg-destructive/10 gap-1.5"
              onClick={() => {
                if (
                  window.confirm(
                    t('datasets:detail.delete_confirm', 'Are you sure you want to delete this dataset?')
                  )
                ) {
                  datasetService
                    .deleteDataset(dataset.id)
                    .then(() => navigate('/datasets'))
                    .catch(() => { });
                }
              }}
            >
              <Trash2 size={14} />
              {t('common:actions.delete', 'Delete')}
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Main Info Card */}
        <Card className="md:col-span-2 shadow-sm border-border hover:shadow-md transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-bold">
              <Database size={18} className="text-primary" />
              {dataset.name}
            </CardTitle>
            <CardDescription className="text-sm">
              {dataset.description || t('datasets:card.no_description', 'No description provided.')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-3 text-xs font-semibold text-muted-foreground">
              <div className="flex items-center gap-1.5 bg-muted/50 px-3 py-1.5 rounded-lg border border-border/50 hover:bg-muted/80 transition-colors">
                <Layers size={13} className="text-primary/70" />
                <span>
                  {t('datasets:card.version_label', 'Version')}:{' '}
                  <span className="text-foreground font-bold">{dataset.current_version || 'v1.0'}</span>
                </span>
              </div>
              <div className="flex items-center gap-1.5 bg-muted/50 px-3 py-1.5 rounded-lg border border-border/50 hover:bg-muted/80 transition-colors">
                <UserCheck size={13} className="text-primary" />
                <span>
                  {t('datasets:detail.role_label', 'Role')}:{' '}
                  <span className="text-foreground font-bold uppercase">{dataset.role || 'N/A'}</span>
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Card */}
        <Card className="shadow-sm border-border hover:shadow-md transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="text-sm font-bold">
              {t('datasets:detail.statistics', 'Statistics')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground group">
                <div className="p-1.5 rounded-md bg-muted group-hover:bg-primary/10 transition-colors">
                  <ImageIcon size={16} className="text-foreground/70 group-hover:text-primary transition-colors" />
                </div>
                {t('datasets:detail.total_images', 'Total Images')}
              </div>
              <span className="font-bold text-foreground text-lg">{dataset.total_images ?? 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground group">
                <div className="p-1.5 rounded-md bg-muted group-hover:bg-primary/10 transition-colors">
                  <CheckCircle size={16} className="text-primary/80 group-hover:text-primary transition-colors" />
                </div>
                {t('datasets:detail.annotated', 'Annotated')}
              </div>
              <span className="font-bold text-foreground text-lg">{dataset.annotated_images ?? 0}</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary/60 to-primary rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${dataset.total_images && dataset.total_images > 0
                      ? Math.round(((dataset.annotated_images ?? 0) / dataset.total_images) * 100)
                      : 0
                    }%`,
                }}
              />
            </div>
            <p className="text-[10px] text-muted-foreground text-center">
              {dataset.total_images && dataset.total_images > 0
                ? `${Math.round(((dataset.annotated_images ?? 0) / dataset.total_images) * 100)}% ${t(
                  'datasets:detail.complete',
                  'complete'
                )}`
                : t('datasets:detail.no_data', 'No data')}
            </p>
          </CardContent>
        </Card>
      </div>
      {/* Upload Images Section */}
      {dataset.role?.toLowerCase() === 'admin' && (
        <DatasetImageUploader
          datasetId={dataset.id}
          currentUserRole={dataset.role}
          onUploadComplete={handleImagesChanged}
        />
      )}

      {/* Image Gallery Section */}
      <DatasetImageGallery
        datasetId={dataset.id}
        currentUserRole={dataset.role}
        onImagesChanged={handleImagesChanged}
      />

      {/* Team Members Section */}
      <DatasetMemberManager
        datasetId={dataset.id}
        currentUserRole={dataset.role}
      />
    </div>
  );
};

export default DatasetDetailPage;

