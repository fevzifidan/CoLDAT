import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Search,
  Loader2,
  AlertCircle,
  ImageIcon,
} from 'lucide-react';
import { datasetTaskService } from '@/features/datasets/services/datasetTaskService';
import AssetTableRow from './AssetTableRow';

export interface AssetItem {
  asset_id: string;
  filename: string;
  mime_type?: string;
  status?: string;
  asset_url?: string | null;
  assigned_to?: string | null; // populated from conflict detection
}

interface AssetSelectionStepProps {
  selectedRole: 'Annotator' | 'Viewer';
  /** Username of the selected user (used for conflict detection) */
  selectedUsername: string;
  /** Dataset ID is now provided from parent (Step 1), not selected here */
  datasetId: string;
  selectedAssetIds: Set<string>;
  onAssetToggle: (assetId: string) => void;
  /** Pre-computed conflict map (asset_id -> assignee_username) from parent */
  assignedAssetMap: Map<string, string>;
}

const AssetSelectionStep = ({
  selectedRole,
  selectedUsername,
  datasetId,
  selectedAssetIds,
  onAssetToggle,
  assignedAssetMap,
}: AssetSelectionStepProps) => {
  const { t } = useTranslation(['tasks']);

  // Assets
  const [assets, setAssets] = useState<AssetItem[]>([]);
  const [assetsLoading, setAssetsLoading] = useState(false);
  const [assetsError, setAssetsError] = useState<string | null>(null);
  const [assetSearch, setAssetSearch] = useState('');
  const [nextCursor, setNextCursor] = useState<string | null>(null);

  // --- Fetch assets when dataset changes ---
  const fetchAssets = useCallback(
    async (datasetId: string, cursor: string | null = null, search: string = '', append = false) => {
      setAssetsLoading(true);
      setAssetsError(null);

      try {
        const response: any = await datasetTaskService.getDatasetImages(datasetId, {
          cursor: cursor ?? undefined,
          search: search || undefined,
          limit: 50,
        });

        const data: AssetItem[] =
          response?.data ?? response?.results ?? response ?? [];

        // Normalise: if API returns `id` instead of `asset_id`
        const normalised = data.map((item: any) => ({
          asset_id: item.asset_id ?? item.id ?? '',
          filename: item.filename ?? '',
          mime_type: item.mime_type,
          status: item.status,
          asset_url: item.asset_url,
          assigned_to: item.assigned_to,
        }));

        setAssets((prev) => (append ? [...prev, ...normalised] : normalised));
        setNextCursor(response?.next_cursor ?? null);
      } catch (err: any) {
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          'Failed to load assets.';
        setAssetsError(msg);
      } finally {
        setAssetsLoading(false);
      }
    },
    []
  );

  // Refetch when dataset changes or search changes
  useEffect(() => {
    if (!datasetId) {
      setAssets([]);
      setNextCursor(null);
      return;
    }

    const timer = setTimeout(() => {
      fetchAssets(datasetId, null, assetSearch);
    }, 300);

    return () => clearTimeout(timer);
  }, [datasetId, assetSearch, fetchAssets]);

  // NOTE: Conflict detection is handled by the parent (CreateTaskPage)
  // using the /datasets/{datasetId}/annotator-assignments endpoint.
  // The assignedAssetMap prop contains pre-computed conflicts.

  // --- Enrich assets with assigned_to info from conflict map ---
  const enrichedAssets: AssetItem[] = assets.map((asset) => ({
    ...asset,
    assigned_to: assignedAssetMap.get(asset.asset_id) || asset.assigned_to || null,
  }));

  // --- Determine if an asset row should be disabled ---
  const isAssetDisabled = useCallback(
    (asset: AssetItem): boolean => {
      if (selectedRole !== 'Annotator') return false;
      const assignedTo = assignedAssetMap.get(asset.asset_id);
      return !!assignedTo && assignedTo !== selectedUsername;
    },
    [selectedRole, assignedAssetMap, selectedUsername]
  );

  // --- Load more assets ---
  const handleLoadMore = () => {
    if (datasetId && nextCursor && !assetsLoading) {
      fetchAssets(datasetId, nextCursor, assetSearch, true);
    }
  };

  // --- Select All logic (only selectable rows) ---
  const selectableAssets = enrichedAssets.filter((a) => !isAssetDisabled(a));
  const allSelectableSelected =
    selectableAssets.length > 0 &&
    selectableAssets.every((a) => selectedAssetIds.has(a.asset_id));
  const someSelected =
    selectableAssets.some((a) => selectedAssetIds.has(a.asset_id)) && !allSelectableSelected;

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      selectableAssets.forEach((a) => {
        if (!selectedAssetIds.has(a.asset_id)) {
          onAssetToggle(a.asset_id);
        }
      });
    } else {
      selectableAssets.forEach((a) => {
        if (selectedAssetIds.has(a.asset_id)) {
          onAssetToggle(a.asset_id);
        }
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t('tasks:create.asset_search_placeholder', 'Search by filename...')}
          value={assetSearch}
          onChange={(e) => setAssetSearch(e.target.value)}
          className="pl-9 h-9 bg-background"
        />
      </div>

      {/* Error State */}
      {assetsError && (
        <div className="flex flex-col items-center gap-3 p-6 rounded-xl border border-destructive/20 bg-destructive/5 text-center">
          <AlertCircle size={24} className="text-destructive" />
          <p className="text-sm text-destructive font-medium">{assetsError}</p>
          <Button
            size="sm"
            variant="outline"
            onClick={() => datasetId && fetchAssets(datasetId, null, assetSearch)}
          >
            {t('tasks:error_try_again', 'Try Again')}
          </Button>
        </div>
      )}

      {/* Loading Skeleton */}
      {assetsLoading && assets.length === 0 && (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-3">
              <Skeleton className="h-5 w-5 rounded" />
              <Skeleton className="h-10 w-10 rounded-md" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-5 w-28 rounded-full" />
            </div>
          ))}
        </div>
      )}

      {/* Asset Table */}
      {!assetsLoading && assets.length > 0 && (
        <div className="rounded-xl border overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    {selectableAssets.length > 0 && (
                      <Checkbox
                        checked={allSelectableSelected}
                        data-state={someSelected ? 'indeterminate' : undefined}
                        onCheckedChange={(checked) => handleSelectAll(!!checked)}
                        aria-label={t('tasks:create.asset_table.select_all', 'Select All')}
                      />
                    )}
                  </TableHead>
                  <TableHead className="w-[52px]">
                    {t('tasks:create.asset_table.preview', 'Preview')}
                  </TableHead>
                  <TableHead>
                    {t('tasks:create.asset_table.filename', 'Filename')}
                  </TableHead>
                  <TableHead className="w-48">
                    {t('tasks:create.asset_table.assignment', 'Status')}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {enrichedAssets.map((asset) => (
                  <AssetTableRow
                    key={asset.asset_id}
                    asset={asset}
                    selected={selectedAssetIds.has(asset.asset_id)}
                    disabled={isAssetDisabled(asset)}
                    onToggle={() => onAssetToggle(asset.asset_id)}
                  />
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Load More */}
          {nextCursor && (
            <div className="flex justify-center p-3 border-t">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLoadMore}
                disabled={assetsLoading}
                className="text-xs gap-2"
              >
                {assetsLoading && <Loader2 size={12} className="animate-spin" />}
                {t('tasks:create.load_more', 'Load More')}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Empty state for assets */}
      {!assetsLoading && !assetsError && assets.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-12 text-muted-foreground">
          <ImageIcon size={32} className="text-muted-foreground/40" />
          <p className="text-sm">
            {t('tasks:create.asset_table.no_assets', 'No assets found in this dataset.')}
          </p>
        </div>
      )}

      {/* Selection count badge */}
      {selectedAssetIds.size > 0 && (
        <div className="flex items-center justify-end">
          <Badge variant="secondary" className="gap-1 text-xs">
            {t('tasks:create.asset_table.selected_count', {
              count: selectedAssetIds.size,
              defaultValue: '{{count}} assets selected',
            })}
          </Badge>
        </div>
      )}
    </div>
  );
};

export default AssetSelectionStep;
