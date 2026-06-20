// frontend/src/features/datasets/components/DatasetImageGallery.tsx
import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ImageIcon,
  Search,
  Loader2,
  AlertCircle,
  RefreshCw,
  ChevronDown,
  X,
  Trash2,
  ExternalLink,
  LayoutGrid,
  List,
  CheckSquare,
  Square,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SelectFilter } from '@/shared/components/SelectFilter';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Guard } from '@/shared/components/Guard';
import { usePermission } from '@/context/PermissionContext';
import { useDatasetImages, type DatasetImage } from '../hooks/useDatasetImages';
import apiService from '@/shared/services/api/api.service';
import notificationService from '@/shared/services/notification/notification.service';
import { useConfirm } from '@/shared/services/confirmation/useConfirm';

interface DatasetImageGalleryProps {
  datasetId: string;
  currentUserRole?: string;
  onImagesChanged?: () => void;
}

type ViewMode = 'table' | 'grid';

/** Status badge config */
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
    className: 'bg-destructive/10 text-destructive border-destructive/20',
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
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

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
    limit: 50,
  });

  // --- Selection helpers ---
  const isAllSelected = images.length > 0 && selectedIds.size === images.length;
  const isIndeterminate = selectedIds.size > 0 && selectedIds.size < images.length;

  const toggleSelectAll = useCallback(() => {
    if (isAllSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(images.map((img) => img.asset_id)));
    }
  }, [isAllSelected, images]);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  // Clear selection when view changes or images reload
  const handleViewChange = (mode: ViewMode) => {
    setViewMode(mode);
    setSelectedIds(new Set());
  };

  // --- Delete single image ---
  const handleDeleteImage = useCallback(
    async (imageId: string, filename: string) => {
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
        setSelectedIds((prev) => {
          const next = new Set(prev);
          next.delete(imageId);
          return next;
        });
        refresh();
        onImagesChanged?.();
      } catch (err: any) {
        notificationService.error(
          err?.response?.data?.message ||
            t('datasets:gallery.delete_error', 'Failed to delete the image.')
        );
      }
    },
    [confirm, t, refresh, onImagesChanged]
  );

  // --- Bulk delete ---
  const handleBulkDelete = useCallback(async () => {
    const count = selectedIds.size;
    const confirmed = await confirm({
      title: t('datasets:gallery.bulk_delete_title', 'Delete Selected Images'),
      description: t('datasets:gallery.bulk_delete_message', {
        count,
        defaultValue: `Are you sure you want to delete ${count} image(s)? This action cannot be undone.`,
      }),
      confirmText: t('common:actions.delete', 'Delete'),
      variant: 'destructive',
    });

    if (!confirmed) return;

    const ids = Array.from(selectedIds);
    let successCount = 0;

    for (const id of ids) {
      try {
        await apiService.delete(`/assets/${id}`);
        successCount++;
      } catch {
        // continue with others
      }
    }

    notificationService.success(
      t('datasets:gallery.bulk_delete_success', {
        count: successCount,
        defaultValue: `${successCount} image(s) deleted successfully.`,
      })
    );

    setSelectedIds(new Set());
    refresh();
    onImagesChanged?.();
  }, [selectedIds, confirm, t, refresh, onImagesChanged]);

  // --- Status badge renderer ---
  const getStatusBadge = (status: string) => {
    const config = statusConfig[status] || statusConfig.FAILED;
    return (
      <Badge variant="outline" className={`text-[10px] ${config.className}`}>
        {config.label}
      </Badge>
    );
  };

  // --- Format date ---
  const formatDate = (iso: string | null | undefined) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // --- Loading state ---
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
              <ImageIcon size={18} className="text-primary" />
              {t('datasets:gallery.title', 'Images')}
              {images.length > 0 && (
                <span className="ml-1 text-xs text-muted-foreground font-normal">
                  ({images.length}{hasNext ? '+' : ''})
                </span>
              )}
            </CardTitle>
            <CardDescription className="text-sm">
              {t('datasets:gallery.description', 'Browse and manage images in this dataset.')}
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            {/* View Switcher */}
            <div className="flex items-center border border-border rounded-lg overflow-hidden">
              <button
                onClick={() => handleViewChange('table')}
                className={`p-2 transition-colors ${
                  viewMode === 'table'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card text-muted-foreground hover:bg-muted'
                }`}
                title={t('datasets:gallery.table_view', 'Table View')}
              >
                <List size={15} />
              </button>
              <button
                onClick={() => handleViewChange('grid')}
                className={`p-2 transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card text-muted-foreground hover:bg-muted'
                }`}
                title={t('datasets:gallery.grid_view', 'Grid View')}
              >
                <LayoutGrid size={15} />
              </button>
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
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Toolbar */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-[180px] max-w-xs">
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

          {/* Status filter */}
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

                    {/* Bulk delete (admin, table mode) */}
          <Guard permission="asset:remove">
          {viewMode === 'table' && selectedIds.size > 0 && (
            <Button
              size="sm"
              variant="destructive"
              onClick={handleBulkDelete}
              className="gap-1.5 ml-auto"
            >
              <Trash2 size={14} />
              {t('datasets:gallery.delete_selected', {
                count: selectedIds.size,
                defaultValue: `Delete (${selectedIds.size})`,
              })}
            </Button>
          )}
          </Guard>
        </div>

        {/* Error State */}
        {error && (
          <div className="p-4 rounded-xl border border-destructive/20 bg-destructive/5 text-center">
            <AlertCircle size={20} className="mx-auto text-destructive mb-1" />
            <p className="text-sm text-destructive font-medium">{error}</p>
            <Button size="sm" variant="outline" className="mt-2" onClick={refresh}>
              {t('common:actions.retry', 'Retry')}
            </Button>
          </div>
        )}

        {/* Empty State */}
        {!error && images.length === 0 && (
          <div className="py-12 text-center border border-dashed border-border rounded-2xl">
            <ImageIcon size={40} className="mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground font-medium">
              {search || statusFilter !== 'ALL'
                ? t('datasets:gallery.no_results', 'No images match the current filters.')
                : t('datasets:gallery.empty', 'No images in this dataset yet. Upload images above.')}
            </p>
          </div>
        )}

        {/* ======================== TABLE VIEW ======================== */}
        {!error && images.length > 0 && viewMode === 'table' && (
          <div className="rounded-xl border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                                    <Guard permission="asset:remove">
                    <TableHead className="w-10 px-3">
                      <button
                        onClick={toggleSelectAll}
                        className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
                        title={isAllSelected ? 'Deselect all' : 'Select all'}
                      >
                        {isAllSelected ? (
                          <CheckSquare size={16} className="text-primary" />
                        ) : isIndeterminate ? (
                          <CheckSquare size={16} className="text-primary/50" />
                        ) : (
                          <Square size={16} />
                        )}
                      </button>
                    </TableHead>
                  </Guard>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>{t('datasets:gallery.col_filename', 'Filename')}</TableHead>
                  <TableHead className="w-28">{t('datasets:gallery.col_status', 'Status')}</TableHead>
                  <TableHead className="w-28 hidden md:table-cell">
                    {t('datasets:gallery.col_type', 'Type')}
                  </TableHead>
                  <TableHead className="w-32 hidden lg:table-cell">
                    {t('datasets:gallery.col_uploaded', 'Uploaded')}
                  </TableHead>
                  <TableHead className="w-20 text-right">
                    {t('datasets:gallery.col_actions', 'Actions')}
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {images.map((img: DatasetImage) => {
                  const isSelected = selectedIds.has(img.asset_id);
                  return (
                    <TableRow
                      key={img.asset_id}
                      className={isSelected ? 'bg-primary/5 dark:bg-primary/10' : ''}
                    >
                                            {/* Checkbox */}
                      <Guard permission="asset:remove">
                        <TableCell className="px-3">
                          <button
                            onClick={() => toggleSelect(img.asset_id)}
                            className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {isSelected ? (
                              <CheckSquare size={15} className="text-primary" />
                            ) : (
                              <Square size={15} />
                            )}
                          </button>
                        </TableCell>
                      </Guard>

                      {/* Thumbnail */}
                      <TableCell className="py-2 px-3">
                        <div className="w-9 h-9 rounded-lg overflow-hidden bg-muted border border-border shrink-0">
                          {img.asset_url ? (
                            <img
                              src={img.asset_url}
                              alt={img.filename}
                              className="w-full h-full object-cover"
                              loading="lazy"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <ImageIcon size={16} className="text-muted-foreground/40" />
                            </div>
                          )}
                        </div>
                      </TableCell>

                      {/* Filename */}
                      <TableCell className="py-2">
                        <span
                          className="text-sm font-medium text-foreground truncate max-w-[220px] block"
                          title={img.filename}
                        >
                          {img.filename}
                        </span>
                      </TableCell>

                      {/* Status */}
                      <TableCell className="py-2">{getStatusBadge(img.status)}</TableCell>

                      {/* MIME type */}
                      <TableCell className="py-2 hidden md:table-cell">
                        <span className="text-xs text-muted-foreground font-mono">
                          {img.mime_type?.split('/')[1]?.toUpperCase() || '—'}
                        </span>
                      </TableCell>

                      {/* Date */}
                      <TableCell className="py-2 hidden lg:table-cell">
                        <span className="text-xs text-muted-foreground">
                          {formatDate(img.asset_url_expiry_at)}
                        </span>
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="py-2 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {img.asset_url && (
                            <a
                              href={img.asset_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                              title={t('datasets:gallery.open_image', 'Open image')}
                            >
                              <ExternalLink size={14} />
                            </a>
                          )}
                                                    <Guard permission="asset:remove">
                            <button
                              onClick={() => handleDeleteImage(img.asset_id, img.filename)}
                              className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                              title={t('common:actions.delete', 'Delete')}
                            >
                              <Trash2 size={14} />
                            </button>
                          </Guard>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}

        {/* ======================== GRID VIEW ======================== */}
        {!error && images.length > 0 && viewMode === 'grid' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {images.map((img: DatasetImage) => (
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
                      <ImageIcon size={32} className="text-muted-foreground/30" />
                    </div>
                  )}

                  {/* Hover overlay */}
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
                                        <Guard permission="asset:remove">
                      <button
                        onClick={() => handleDeleteImage(img.asset_id, img.filename)}
                        className="p-1.5 rounded-lg bg-destructive/60 hover:bg-destructive text-white transition-colors"
                        title={t('common:actions.delete', 'Delete')}
                      >
                        <Trash2 size={14} />
                      </button>
                    </Guard>
                  </div>
                </div>

                {/* Info */}
                <div className="p-2 space-y-1">
                  <p className="text-xs font-medium truncate text-foreground" title={img.filename}>
                    {img.filename}
                  </p>
                  <div className="flex items-center justify-between">
                    {getStatusBadge(img.status)}
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
