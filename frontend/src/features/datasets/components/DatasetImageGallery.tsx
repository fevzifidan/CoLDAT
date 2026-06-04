// frontend/src/features/datasets/components/DatasetImageGallery.tsx
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ImageIcon,
  Search,
  Loader2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  ChevronDown,
  X,
  Trash2,
  ExternalLink,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SelectFilter } from '@/shared/components/SelectFilter';
import { useDatasetImages, type DatasetImage } from '../hooks/useDatasetImages';
import apiService from '@/shared/services/api/api.service';
import notificationService from '@/shared/services/notification/notification.service';
import { useConfirm } from '@/shared/services/confirmation/useConfirm';

interface DatasetImageGalleryProps {
  datasetId: string;
  currentUserRole?: string;
  onImagesChanged?: () => void;
}

/** Status badge renk eşlemesi */
const statusConfig: Record<string, { label: string; className: string }> = {
  UPLOADED: {
    label: 'UPLOADED',
    className:
      'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900',
  },
  PENDING: {
    label: 'PENDING',
    className:
      'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900 animate-pulse',
  },
  VERIFICATION_FAILED: {
    label: 'VERIFY_FAILED',
    className:
      'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900',
  },
  FAILED: {
    label: 'FAILED',
    className:
      'bg-destructive/10 text-destructive border-destructive/20',
  },
};

const DatasetImageGallery: React.FC<DatasetImageGalleryProps> = ({
  datasetId,
  currentUserRole,
  onImagesChanged,
}) => {
  const { t } = useTranslation(['datasets', 'common']);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const isAdmin = currentUserRole?.toLowerCase() === 'admin';
  const { confirm } = useConfirm();

  const {
    images,
    loading,
    initialLoading,
    hasNext,
    loadMore,
    refresh,
    error,
  } = useDatasetImages(datasetId, {
    search: search || undefined,
    status: statusFilter !== 'ALL' ? statusFilter.toLowerCase() : undefined,
    limit: 20,
  });

  const filteredImages = images;

  /** Görsel silme */
  const handleDeleteImage = async (imageId: string, filename: string) => {
    const confirmed = await confirm({
      title: t('datasets:gallery.delete_confirm_title', 'Delete Image'),
      description: t('datasets:gallery.delete_confirm_message', {
        filename,
        defaultValue: `Are you sure you want to permanently delete "${filename}"? This will also remove its annotations.`,
      }),
      confirmText: t('common:actions.delete', 'Delete'),
      variant: 'destructive',
    });

    if (!confirmed) return;

    try {
      await apiService.delete(`/assets/${imageId}`);
      notificationService.success(
        t('datasets:gallery.delete_success', {
          filename,
          defaultValue: `"${filename}" deleted successfully.`,
        })
      );
      refresh();
      onImagesChanged?.();
    } catch (err: any) {
      notificationService.error(
        err?.response?.data?.message ||
          t('datasets:gallery.delete_error', 'Failed to delete the image.')
      );
    }
  };

  const getStatusBadge = (status: string) => {
    const config = statusConfig[status] || statusConfig.FAILED;
    return (
      <Badge variant="outline" className={config.className}>
        {config.label}
      </Badge>
    );
  };

  if (initialLoading) {
    return (
      <Card className="shadow-sm border-border">
        <CardContent className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <Loader2 size={20} className="animate-spin text-primary" />
            <p className="text-sm">{t('common:status.loading', 'Loading...')}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base font-bold">
              <ImageIcon size={18} className="text-sky-500" />
              {t('datasets:gallery.title', 'Images')}
            </CardTitle>
            <CardDescription className="text-sm">
              {t(
                'datasets:gallery.description',
                'Browse and manage images in this dataset.'
              )}
            </CardDescription>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={refresh}
            disabled={loading}
            className="gap-1.5"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            {t('common:actions.refresh', 'Refresh')}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Search & Filter */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('datasets:gallery.search_placeholder', 'Search by filename...')}
              className="pl-9 h-9 bg-card border-border text-foreground placeholder:text-muted-foreground rounded-xl"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <SelectFilter
            value={statusFilter}
            onChange={(v) => setStatusFilter(v)}
            triggerClassName="w-36"
            options={[
              { value: 'ALL', label: t('common:filter.all', 'All') },
              { value: 'UPLOADED', label: 'UPLOADED' },
              { value: 'PENDING', label: 'PENDING' },
              { value: 'VERIFICATION_FAILED', label: 'VERIFY_FAILED' },
              { value: 'FAILED', label: 'FAILED' },
            ]}
          />

          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {t('datasets:gallery.total_count', {
              count: filteredImages.length,
              defaultValue: `{{count}} image(s)`,
            })}
          </span>
        </div>

        {/* Error State */}
        {error && (
          <div className="p-4 rounded-xl border border-destructive/20 bg-destructive/5 text-center">
            <AlertCircle size={20} className="mx-auto text-destructive mb-1" />
            <p className="text-sm text-destructive font-medium">{error}</p>
            <Button
              size="sm"
              variant="outline"
              className="mt-2"
              onClick={refresh}
            >
              {t('common:actions.retry', 'Retry')}
            </Button>
          </div>
        )}

        {/* Empty State */}
        {!error && filteredImages.length === 0 && (
          <div className="py-12 text-center border border-dashed border-border rounded-2xl">
            <ImageIcon size={40} className="mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground font-medium">
              {search || statusFilter !== 'ALL'
                ? t(
                    'datasets:gallery.no_results',
                    'No images match the current filters.'
                  )
                : t(
                    'datasets:gallery.empty',
                    'No images in this dataset yet. Upload images above.'
                  )}
            </p>
          </div>
        )}

        {/* Image Grid */}
        {filteredImages.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredImages.map((img) => (
              <div
                key={img.asset_id}
                className="group relative rounded-xl border border-border overflow-hidden bg-card hover:shadow-md transition-all"
              >
                {/* Thumbnail */}
                <div className="aspect-square bg-muted relative overflow-hidden">
                  {img.asset_url ? (
                    <img
                      src={img.asset_url}
                      alt={img.filename}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '';
                        (e.target as HTMLImageElement).classList.add('hidden');
                      }}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <ImageIcon
                        size={32}
                        className="text-muted-foreground/30"
                      />
                    </div>
                  )}

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                    {img.asset_url && (
                      <a
                        href={img.asset_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors"
                        title={t('datasets:gallery.open_image', 'Open image')}
                      >
                        <ExternalLink size={14} />
                      </a>
                    )}
                    {isAdmin && (
                      <button
                        onClick={() => handleDeleteImage(img.asset_id, img.filename)}
                        className="p-1.5 rounded-lg bg-destructive/60 hover:bg-destructive text-white transition-colors"
                        title={t('common:actions.delete', 'Delete')}
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Info */}
                <div className="p-2 space-y-1">
                  <p className="text-xs font-medium truncate text-foreground" title={img.filename}>
                    {img.filename}
                  </p>
                  <div className="flex items-center justify-between">
                    {getStatusBadge(img.status)}
                    {img.asset_url_expiry_at && (
                      <span
                        className="text-[10px] text-muted-foreground flex items-center gap-0.5"
                        title={t('datasets:gallery.url_expires', 'URL expires at') + ': ' + new Date(img.asset_url_expiry_at).toLocaleString()}
                      >
                        <Clock size={10} />
                        {Math.round(
                          (new Date(img.asset_url_expiry_at).getTime() - Date.now()) / 60000
                        )}
                        {t('datasets:gallery.minutes', 'm')}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Load More */}
        {hasNext && (
          <div className="flex justify-center pt-2">
            <Button
              onClick={loadMore}
              variant="outline"
              disabled={loading}
              className="gap-2"
            >
              {loading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <ChevronDown size={14} />
              )}
              {loading
                ? t('common:status.loading', 'Loading...')
                : t('common:actions.load_more', 'Load More')}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DatasetImageGallery;
