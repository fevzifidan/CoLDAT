import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Check, ChevronsUpDown, Loader2, Database, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCursorPagination } from '@/shared/hooks/useCursorPagination';
import { datasetAdminService, type AdminDataset } from '../services/datasetAdminService';

interface AdminDatasetComboBoxProps {
  value: string;
  onChange: (datasetId: string, datasetName: string) => void;
}

export const AdminDatasetComboBox: React.FC<AdminDatasetComboBoxProps> = ({ value, onChange }) => {
  const { t } = useTranslation(['api-keys', 'common']);
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  const fetchAdminDatasets = useCallback(
    async (cursor: string | null, limit: number) => {
      const res = await datasetAdminService.list({ limit, after: cursor });
      return { data: res.data, next_cursor: res.next_cursor };
    },
    []
  );

  const {
    items: allDatasets,
    loading,
    hasNext,
    loadMore,
  } = useCursorPagination<AdminDataset>({
    fetchFn: fetchAdminDatasets,
    limit: 20,
    enabled: true,
    manualFirstPage: false,
  });

    // Guard ile kontrol edilen admin dataset'leri (backend'den sadece admin olunan dataset'ler döner)
  const adminDatasets = allDatasets.filter(ds => ds.role === 'admin');

  // Client-side arama
  const filteredDatasets = searchQuery
    ? adminDatasets.filter(ds =>
        ds.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : adminDatasets;

  // Seçili dataset'in adını bul
  const selectedDataset = adminDatasets.find(ds => ds.id === value);

  // Popover açılınca input'a odaklan
  useEffect(() => {
    if (open) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [open]);

  // Popover kapandığında aramayı sıfırla
  useEffect(() => {
    if (!open) setSearchQuery('');
  }, [open]);

  const handleSelect = useCallback((id: string, name: string) => {
    onChange(id, name);
    setOpen(false);
  }, [onChange]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            'w-full justify-between font-normal',
            !value && 'text-muted-foreground'
          )}
        >
          <div className="flex items-center gap-2 truncate">
            <Database className="h-4 w-4 shrink-0 text-muted-foreground" />
            {value && selectedDataset
              ? selectedDataset.name
              : t('api-keys:dataset_selector.placeholder')}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <div className="flex items-center border-b px-3">
          <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          <Input
            ref={searchInputRef}
            placeholder={t('api-keys:dataset_selector.search_placeholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border-0 bg-transparent p-2 placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:outline-none"
          />
        </div>
        <ScrollArea className="max-h-72">
          {loading && adminDatasets.length === 0 ? (
            <div className="flex items-center justify-center py-6 text-sm text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t('api-keys:dataset_selector.loading')}
            </div>
          ) : filteredDatasets.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              {searchQuery
                ? t('common:status.no_results')
                : t('api-keys:dataset_selector.no_admin_datasets')}
            </div>
          ) : (
            <>
              {filteredDatasets.map((ds) => (
                <button
                  key={ds.id}
                  onClick={() => handleSelect(ds.id, ds.name)}
                  className={cn(
                    'flex w-full items-center gap-2 px-3 py-2.5 text-sm hover:bg-accent transition-colors',
                    value === ds.id && 'bg-accent'
                  )}
                >
                  <Check
                    className={cn(
                      'h-4 w-4 shrink-0',
                      value === ds.id ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  <Database className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="flex-1 text-left truncate">{ds.name}</span>
                  <Badge variant="secondary" className="shrink-0 text-[10px] px-1.5 py-0">
                    {ds.role}
                  </Badge>
                </button>
              ))}
              {hasNext && (
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-1 border-t px-3 py-2.5 text-xs text-muted-foreground hover:bg-accent transition-colors disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    t('api-keys:dataset_selector.load_more')
                  )}
                </button>
              )}
            </>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};
