// src/features/datasets/UserAssetsPage.tsx
import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { SelectFilter } from '@/shared/components/SelectFilter';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { assetService, type UserAsset } from './services/assetService';
import { useCursorPagination } from '@/shared/hooks/useCursorPagination';
import {
  ImageIcon,
  Loader2,
  AlertCircle,
  FileIcon,
  Search,
  RefreshCw,
  LayoutGrid,
  Clock,
  HardDrive,
  Box,
  CheckCircle2,
  Hourglass,
  XCircle,
  AlertTriangle,
  List,
  FileImage,
  FileText,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

// ─── Constants ──────────────────────────────────────────────
const STATUS_OPTIONS = [
  { value: 'ALL', label: 'All Statuses' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'UPLOADED', label: 'Uploaded' },
  { value: 'VERIFICATION_FAILED', label: 'Verification Failed' },
  { value: 'FAILED', label: 'Failed' },
];

const PAGE_SIZE_OPTIONS = [20, 50, 100];

type ViewMode = 'grid' | 'table';

// ─── Helpers ─────────────────────────────────────────────────
const getStatusBadge = (status: string) => {
  switch (status?.toUpperCase()) {
    case 'PENDING':
      return {
        className:
          'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-400 dark:border-amber-800/60',
        icon: Hourglass,
        label: 'Pending',
      };
    case 'UPLOADED':
      return {
        className:
          'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800/60',
        icon: CheckCircle2,
        label: 'Uploaded',
      };
    case 'VERIFICATION_FAILED':
      return {
        className:
          'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-400 dark:border-rose-800/60',
        icon: AlertTriangle,
        label: 'Verify Failed',
      };
    case 'FAILED':
      return {
        className:
          'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/60 dark:text-red-400 dark:border-red-800/60',
        icon: XCircle,
        label: 'Failed',
      };
    default:
      return {
        className: 'bg-muted/50 text-muted-foreground border-border/60',
        icon: Box,
        label: status ?? 'Unknown',
      };
  }
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

const getTimeAgo = (dateStr: string) => {
  const now = Date.now();
  const past = new Date(dateStr).getTime();
  const diffMs = now - past;
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `${diffDays}d ago`;
  return formatDate(dateStr);
};

const getFileTypeIcon = (mimeType: string) => {
  if (mimeType?.startsWith('image/')) return ImageIcon;
  return FileIcon;
};

// ─── StatCard Component ──────────────────────────────────────
interface StatCardProps {
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
  bgColor: string;
}

const StatCard = ({ label, value, icon: Icon, color, bgColor }: StatCardProps) => (
  <div className="group relative overflow-hidden rounded-xl border border-border/40 bg-card/50 p-4 hover:shadow-md hover:border-border/70 transition-all duration-300">
    <div
      className={`absolute -top-8 -right-8 w-24 h-24 ${bgColor} rounded-full blur-2xl opacity-30 group-hover:opacity-50 transition-opacity pointer-events-none`}
    />
    <div className="relative z-10 flex items-center justify-between">
      <div>
        <p className="text-[11px] font-semibold text-muted-foreground/70 uppercase tracking-widest">
          {label}
        </p>
        <p className={`text-2xl font-extrabold mt-1.5 ${color}`}>{value}</p>
      </div>
      <div className={`w-10 h-10 rounded-xl ${bgColor}/20 flex items-center justify-center`}>
        <Icon size={20} className={color} />
      </div>
    </div>
  </div>
);

// ─── AssetCard Component ─────────────────────────────────────
interface AssetCardProps {
  asset: UserAsset;
}

const AssetCard = ({ asset }: AssetCardProps) => {
  const statusInfo = getStatusBadge(asset.status);
  const StatusIcon = statusInfo.icon;
  const FileTypeIcon = getFileTypeIcon(asset.mime_type);

  return (
    <div className="group relative overflow-hidden rounded-xl border border-border/40 bg-card shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      {/* Thumbnail / Preview */}
      <div className="aspect-[4/3] bg-gradient-to-br from-muted/60 via-muted/40 to-muted/70 flex items-center justify-center overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent pointer-events-none" />
        <FileTypeIcon
          size={48}
          className="text-muted-foreground/20 group-hover:text-muted-foreground/40 group-hover:scale-110 transition-all duration-500"
        />

        {/* Status Badge Overlay */}
        <div
          className={`absolute top-3 right-3 inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full border shadow-sm backdrop-blur-sm ${statusInfo.className}`}
        >
          <StatusIcon size={10} />
          <span>{statusInfo.label}</span>
        </div>

        <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-primary/0 via-primary/40 to-primary/0 scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
      </div>

      {/* Details */}
      <div className="p-4 space-y-2.5">
        <div className="flex items-start justify-between gap-2">
          <h3
            className="font-semibold text-sm text-foreground truncate flex-1 group-hover:text-primary transition-colors"
            title={asset.filename}
          >
            {asset.filename}
          </h3>
        </div>

        {/* Metadata tags */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px] text-muted-foreground/70">
          {asset.width != null && asset.height != null && (
            <span className="inline-flex items-center gap-1.5 bg-muted/30 px-2 py-0.5 rounded-md">
              <LayoutGrid size={10} className="text-muted-foreground/50" />
              {asset.width} × {asset.height}
            </span>
          )}
          {asset.mime_type && (
            <span className="inline-flex items-center gap-1.5 bg-muted/30 px-2 py-0.5 rounded-md">
              <HardDrive size={10} className="text-muted-foreground/50" />
              {asset.mime_type.split('/').pop()?.toUpperCase()}
            </span>
          )}
          <span className="inline-flex items-center gap-1.5 bg-muted/30 px-2 py-0.5 rounded-md">
            <Clock size={10} className="text-muted-foreground/50" />
            {getTimeAgo(asset.created_at)}
          </span>
        </div>

        <div className="text-[10px] text-muted-foreground/40 font-mono tracking-tight">
          {formatDate(asset.created_at)}
        </div>
      </div>
    </div>
  );
};

// ─── AssetTableRow Component ─────────────────────────────────
interface AssetTableRowProps {
  asset: UserAsset;
}

const AssetTableRow = ({ asset }: AssetTableRowProps) => {
  const statusInfo = getStatusBadge(asset.status);
  const StatusIcon = statusInfo.icon;

  return (
    <TableRow className="cursor-pointer hover:bg-muted/50 transition-colors">
      <TableCell className="py-3">
        <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center text-muted-foreground">
          {asset.mime_type?.startsWith('image/') ? (
            <FileImage size={14} />
          ) : (
            <FileText size={14} />
          )}
        </div>
      </TableCell>
      <TableCell className="py-3 font-medium max-w-[220px]">
        <span className="text-sm truncate block" title={asset.filename}>
          {asset.filename}
        </span>
        <p className="text-[10px] text-muted-foreground/50 font-mono truncate mt-0.5">
          {asset.id}
        </p>
      </TableCell>
      <TableCell className="py-3 text-xs text-muted-foreground hidden sm:table-cell">
        {asset.width != null && asset.height != null
          ? `${asset.width} × ${asset.height}`
          : '—'}
      </TableCell>
      <TableCell className="py-3 text-xs text-muted-foreground hidden md:table-cell">
        {asset.mime_type?.split('/').pop()?.toUpperCase() || '—'}
      </TableCell>
      <TableCell className="py-3">
        <span
          className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full border shadow-sm ${statusInfo.className}`}
        >
          <StatusIcon size={10} />
          <span>{statusInfo.label}</span>
        </span>
      </TableCell>
      <TableCell className="py-3 text-xs text-muted-foreground/60 whitespace-nowrap hidden lg:table-cell">
        {getTimeAgo(asset.created_at)}
      </TableCell>
    </TableRow>
  );
};

// ─── Main Page Component ─────────────────────────────────────
const UserAssetsPage = () => {
  const { t } = useTranslation(['pages', 'common', 'datasets']);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [pageSize, setPageSize] = useState(50);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Cursor-based pagination ──
  const {
    items: paginatedAssets,
    loading,
    error,
    hasNext,
    hasPrev,
    currentPage,
    goNext,
    goPrev,
    reset,
    initialLoading,
  } = useCursorPagination<UserAsset>({
    fetchFn: async (cursor, limit) => {
      const params: Record<string, any> = {};
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (searchQuery.trim()) params.search = searchQuery.trim();
      if (limit) params.limit = limit;
      if (cursor) params.after = cursor;
      return await assetService.getUserAssets(params);
    },
    limit: pageSize,
    mode: 'paginated',
    enabled: true,
  });

  // Debounced search/filter -> reset pagination
  useEffect(() => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      reset();
    }, 300);
    return () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    };
  }, [searchQuery, statusFilter, reset]);

  // Reset when page size changes
  useEffect(() => {
    reset();
  }, [pageSize, reset]);

  const handleRefresh = () => {
    reset();
  };

  // Stats (paginated assets üzerinden değil — tüm veri gelmediği için sadece mevcut sayfadaki)
  const totalCount = paginatedAssets.length;
  const uploadedCount = paginatedAssets.filter(
    (a) => a.status?.toUpperCase() === 'UPLOADED'
  ).length;
  const pendingCount = paginatedAssets.filter(
    (a) => a.status?.toUpperCase() === 'PENDING'
  ).length;
  const failedCount = paginatedAssets.filter((a) =>
    ['FAILED', 'VERIFICATION_FAILED'].includes(a.status?.toUpperCase())
  ).length;

  const hasActiveFilters = searchQuery.trim() !== '' || statusFilter !== 'ALL';

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* ═══════ HEADER ═══════ */}
      <div className="relative overflow-hidden rounded-2xl border border-border/30 bg-gradient-to-br from-card via-card/90 to-card/70 p-6 shadow-lg backdrop-blur-sm">
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-16 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="hidden sm:flex w-12 h-12 rounded-xl bg-primary/10 text-primary items-center justify-center shrink-0 shadow-sm">
              <ImageIcon size={22} />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
                {t('pages:user_assets.title', 'My Assets')}
              </h1>
              <p className="text-sm text-muted-foreground/70 mt-1 max-w-md">
                {t(
                  'pages:user_assets.subtitle',
                  'All uploaded assets across datasets'
                )}
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
              <Input
                placeholder={t(
                  'pages:user_assets.search_placeholder',
                  'Search by filename...'
                )}
                className="pl-10 h-10 w-48 lg:w-56 bg-background/50 border-border/50 text-foreground placeholder:text-muted-foreground/40 rounded-xl focus:border-primary/40 focus:bg-background/80 transition-all text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <SelectFilter
              value={statusFilter}
              onChange={(v) => setStatusFilter(v)}
              triggerClassName="w-36 lg:w-40 h-10 rounded-xl bg-background/50 border-border/50"
              options={STATUS_OPTIONS.map((opt) => ({
                value: opt.value,
                label: opt.label,
              }))}
            />

            {/* View Mode Toggle */}
            <ToggleGroup
              type="single"
              value={viewMode}
              onValueChange={(v) => v && setViewMode(v as ViewMode)}
              className="hidden sm:flex border border-border/50 rounded-xl bg-background/50"
            >
              <ToggleGroupItem
                value="grid"
                aria-label="Grid view"
                className="h-10 w-10 rounded-xl data-[state=on]:bg-accent/80 data-[state=on]:text-accent-foreground"
              >
                <LayoutGrid size={14} />
              </ToggleGroupItem>
              <ToggleGroupItem
                value="table"
                aria-label="Table view"
                className="h-10 w-10 rounded-xl data-[state=on]:bg-accent/80 data-[state=on]:text-accent-foreground"
              >
                <List size={14} />
              </ToggleGroupItem>
            </ToggleGroup>

            {/* Page Size Selector */}
            <Select
              value={String(pageSize)}
              onValueChange={(v) => setPageSize(Number(v))}
            >
              <SelectTrigger className="hidden sm:flex h-10 w-[72px] rounded-xl bg-background/50 border-border/50 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <SelectItem key={size} value={String(size)} className="text-xs">
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={loading}
              className="h-10 gap-2 rounded-xl px-4 border-border/50 bg-background/50 hover:bg-accent/50 transition-all"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">
                {t('common:actions.refresh', 'Refresh')}
              </span>
            </Button>
          </div>
        </div>
      </div>

      {/* ═══════ ERROR ═══════ */}
      {error && (
        <div className="relative overflow-hidden rounded-2xl border border-destructive/20 bg-destructive/5 p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center">
              <AlertCircle size={32} className="text-destructive" />
            </div>
            <div>
              <p className="text-base font-semibold text-destructive">{error}</p>
              <p className="text-sm text-muted-foreground/60 mt-1">
                {t(
                  'common:status.something_wrong',
                  'Something went wrong. Please try again.'
                )}
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={handleRefresh}
              className="rounded-xl border-destructive/20 hover:bg-destructive/10"
            >
              <RefreshCw size={14} className="mr-2" />
              {t('common:status.retry', 'Retry')}
            </Button>
          </div>
        </div>
      )}

      {/* ═══════ LOADING (initial) ═══════ */}
      {initialLoading && (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-muted-foreground">
          <div className="relative">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <div className="absolute inset-0 h-8 w-8 rounded-full bg-primary/5 animate-ping" />
          </div>
          <p className="text-sm font-medium">
            {t('common:status.loading', 'Loading assets...')}
          </p>
        </div>
      )}

      {/* ═══════ STATS CARDS ═══════ */}
      {!initialLoading && !error && paginatedAssets.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <StatCard
            label="This Page"
            value={totalCount}
            icon={Box}
            color="text-primary"
            bgColor="bg-primary"
          />
          <StatCard
            label="Uploaded"
            value={uploadedCount}
            icon={CheckCircle2}
            color="text-emerald-600 dark:text-emerald-400"
            bgColor="bg-emerald-500"
          />
          <StatCard
            label="Pending"
            value={pendingCount}
            icon={Hourglass}
            color="text-amber-600 dark:text-amber-400"
            bgColor="bg-amber-500"
          />
          <StatCard
            label="Failed"
            value={failedCount}
            icon={XCircle}
            color="text-red-600 dark:text-red-400"
            bgColor="bg-red-500"
          />
        </div>
      )}

      {/* ═══════ EMPTY ═══════ */}
      {!initialLoading && !error && paginatedAssets.length === 0 && (
        <div className="relative overflow-hidden rounded-2xl border border-border/30 bg-gradient-to-b from-card/30 to-card/10 p-16 sm:p-20 text-center">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/3 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-muted/40 flex items-center justify-center border border-border/20 shadow-sm">
              <ImageIcon size={38} className="text-muted-foreground/25" />
            </div>
            <div className="space-y-1.5 max-w-sm">
              <p className="text-lg font-semibold text-foreground/70">
                {hasActiveFilters
                  ? t(
                      'pages:user_assets.no_results',
                      'No matching assets'
                    )
                  : t(
                      'pages:user_assets.empty',
                      'No assets found.'
                    )}
              </p>
              <p className="text-sm text-muted-foreground/50 leading-relaxed">
                {hasActiveFilters
                  ? t(
                      'pages:user_assets.empty_filter_hint',
                      'Try adjusting your search or filter criteria.'
                    )
                  : t(
                      'pages:user_assets.empty_hint',
                      'Assets you upload to any dataset will appear here for easy browsing.'
                    )}
              </p>
            </div>
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('ALL');
                }}
                className="rounded-xl border-border/40"
              >
                <RefreshCw size={14} className="mr-2" />
                Clear Filters
              </Button>
            )}
          </div>
        </div>
      )}

      {/* ═══════ ASSETS: GRID VIEW ═══════ */}
      {!initialLoading && !error && paginatedAssets.length > 0 && viewMode === 'grid' && (
        <>
          <div className="flex items-center justify-between text-xs text-muted-foreground/50 px-1">
            <span className="font-medium">
              Page {currentPage} · {paginatedAssets.length} asset{paginatedAssets.length !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {paginatedAssets.map((asset) => (
              <AssetCard key={asset.id} asset={asset} />
            ))}
          </div>

          {/* Grid Pagination */}
          <div className="flex items-center justify-between px-1 py-3 border-t border-border/40">
            <span className="text-[11px] text-muted-foreground/50">
              {paginatedAssets.length} items
              {!hasNext && ` · Last page`}
            </span>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                disabled={!hasPrev || loading}
                onClick={goPrev}
                className="h-8 w-8 p-0 rounded-lg"
              >
                <ChevronLeft size={14} />
              </Button>
              <span className="text-xs font-medium text-muted-foreground min-w-[40px] text-center tabular-nums">
                {currentPage}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={!hasNext || loading}
                onClick={goNext}
                className="h-8 w-8 p-0 rounded-lg"
              >
                <ChevronRight size={14} />
              </Button>
            </div>
          </div>
        </>
      )}

      {/* ═══════ ASSETS: TABLE VIEW ═══════ */}
      {!initialLoading && !error && paginatedAssets.length > 0 && viewMode === 'table' && (
        <div className="border border-border/40 rounded-xl overflow-hidden bg-card shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px] text-xs">Type</TableHead>
                <TableHead className="text-xs">Filename</TableHead>
                <TableHead className="hidden sm:table-cell text-xs">Dimensions</TableHead>
                <TableHead className="hidden md:table-cell text-xs">Format</TableHead>
                <TableHead className="text-xs">Status</TableHead>
                <TableHead className="hidden lg:table-cell text-xs">Uploaded</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedAssets.map((asset) => (
                <AssetTableRow key={asset.id} asset={asset} />
              ))}
            </TableBody>
          </Table>

          {/* Table Pagination */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-border/40 bg-muted/30">
            <span className="text-[11px] text-muted-foreground">
              Page {currentPage} · {paginatedAssets.length} items
              {!hasNext && ` · Last page`}
            </span>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                disabled={!hasPrev || loading}
                onClick={goPrev}
                className="h-8 w-8 p-0 rounded-lg"
              >
                <ChevronLeft size={14} />
              </Button>
              <span className="text-xs font-medium text-muted-foreground min-w-[40px] text-center tabular-nums">
                {currentPage}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={!hasNext || loading}
                onClick={goNext}
                className="h-8 w-8 p-0 rounded-lg"
              >
                <ChevronRight size={14} />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserAssetsPage;
