// src/features/datasets/UserAssetsPage.tsx
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SelectFilter } from '@/shared/components/SelectFilter';
import { useCursorPagination } from '@/shared/hooks/useCursorPagination';
import { assetService, type UserAsset } from './services/assetService';
import {
  ImageIcon,
  Loader2,
  AlertCircle,
  FileIcon,
  Search,
  RefreshCw,
} from 'lucide-react';

const STATUS_OPTIONS = [
  { value: 'ALL', label: 'All Statuses' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'UPLOADED', label: 'Uploaded' },
  { value: 'VERIFICATION_FAILED', label: 'Verification Failed' },
  { value: 'FAILED', label: 'Failed' },
];

const getStatusBadge = (status: string) => {
  switch (status?.toUpperCase()) {
    case 'PENDING':
      return 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800';
    case 'UPLOADED':
      return 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800';
    case 'VERIFICATION_FAILED':
      return 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-950 dark:text-rose-400 dark:border-rose-800';
    case 'FAILED':
      return 'bg-destructive/10 text-destructive border-destructive/20';
    default:
      return 'bg-muted text-muted-foreground border-border';
  }
};

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const UserAssetsPage = () => {
  const { t } = useTranslation(['pages', 'common', 'datasets']);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const {
    items: assets,
    loading,
    hasNext,
    loadMore,
    error,
    reset,
    initialLoading,
  } = useCursorPagination<UserAsset>({
    fetchFn: async (cursor, limit) => {
      const params: any = { limit };
      if (cursor) params.after = cursor;
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (searchQuery.trim()) params.dataset_name = searchQuery.trim();
      return assetService.getUserAssets(params);
    },
    limit: 20,
    mode: 'accumulate',
  });

  const handleRefresh = () => {
    reset();
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 border-border">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            {t('pages:user_assets.title', 'My Assets')}
          </h1>
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold mt-1">
            {t('pages:user_assets.subtitle', 'All uploaded assets across datasets')}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-56">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('pages:user_assets.search_placeholder', 'Search by dataset...')}
              className="pl-9 h-9 bg-card border-border text-foreground placeholder:text-muted-foreground rounded-xl"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <SelectFilter
            value={statusFilter}
            onChange={(v) => {
              setStatusFilter(v);
              reset();
            }}
            triggerClassName="w-44"
            options={STATUS_OPTIONS.map((opt) => ({
              value: opt.value,
              label: opt.label,
            }))}
          />

          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="h-9 gap-1.5 rounded-xl"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            {t('common:actions.refresh', 'Refresh')}
          </Button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
          <AlertCircle size={28} className="text-destructive" />
          <p className="text-sm text-destructive font-medium">{error}</p>
          <Button size="sm" variant="outline" onClick={reset}>
            {t('common:status.retry', 'Retry')}
          </Button>
        </div>
      )}

      {/* Initial Loading */}
      {initialLoading && (
        <div className="flex justify-center items-center py-20 text-muted-foreground gap-2">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          {t('common:status.loading', 'Loading assets...')}
        </div>
      )}

      {/* Empty State */}
      {!initialLoading && !error && assets.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
          <ImageIcon size={48} className="text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground font-medium">
            {t('pages:user_assets.empty', 'No assets found.')}
          </p>
          <p className="text-xs text-muted-foreground max-w-sm">
            {t('pages:user_assets.empty_hint', 'Assets you upload will appear here.')}
          </p>
        </div>
      )}

      {/* Asset List */}
      {!initialLoading && !error && assets.length > 0 && (
        <>
          <div className="space-y-3">
            {assets.map((asset) => (
              <div
                key={asset.id}
                className="flex items-center gap-4 p-4 bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Thumbnail / Icon */}
                <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center shrink-0 overflow-hidden">
                  {asset.thumbnail_url ? (
                    <img
                      src={asset.thumbnail_url}
                      alt={asset.filename}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <FileIcon size={20} className="text-muted-foreground" />
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-foreground truncate">
                      {asset.filename}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusBadge(asset.status)}`}>
                      {asset.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span>
                      {asset.width} × {asset.height}
                    </span>
                    <span>{formatFileSize(asset.file_size)}</span>
                    {asset.dataset_name && (
                      <span>
                        {t('pages:user_assets.dataset_label', 'Dataset')}: {asset.dataset_name}
                      </span>
                    )}
                    <span>{formatDate(asset.created_at)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Load More */}
          {hasNext && (
            <div className="flex justify-center mt-6">
              <Button
                onClick={loadMore}
                variant="outline"
                disabled={loading}
                className="px-8 rounded-xl"
              >
                {loading
                  ? t('common:status.loading', 'Loading...')
                  : t('common:actions.load_more', 'Load More')}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default UserAssetsPage;
