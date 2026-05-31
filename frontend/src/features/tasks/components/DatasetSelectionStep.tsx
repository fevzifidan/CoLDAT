// frontend/src/features/tasks/components/DatasetSelectionStep.tsx
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Search,
  Loader2,
  AlertCircle,
  Database,
  ImageIcon,
  CheckCircle2,
} from 'lucide-react';
import { datasetService } from '@/features/datasets/services/datasetService';

export interface DatasetResult {
  id: string;
  project_id?: string;
  name: string;
  description?: string;
  current_version?: string;
  total_images?: number;
  role?: string;
}

interface DatasetSelectionStepProps {
  onSelect: (dataset: DatasetResult) => void;
  selectedDataset: DatasetResult | null;
}

const DatasetSelectionStep = ({ onSelect, selectedDataset }: DatasetSelectionStepProps) => {
  const { t } = useTranslation(['tasks']);

  const [datasets, setDatasets] = useState<DatasetResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchDatasets = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await datasetService.getAllDatasets(null, { limit: 100 });
        const data: DatasetResult[] = result?.data ?? result ?? [];
        setDatasets(data);
      } catch (err: any) {
        const msg = err?.message || 'Failed to load datasets.';
        setError(msg);
      } finally {
        setLoading(false);
      }
    };
    fetchDatasets();
  }, []);

  const filteredDatasets = datasets.filter((ds) =>
    ds.name.toLowerCase().includes(search.toLowerCase())
  );

  const selectedId = selectedDataset?.id;

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t('tasks:create.dataset_search_placeholder', 'Search datasets...')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 h-10 bg-background"
          autoFocus
        />
      </div>

      {/* Error */}
      {error && (
        <div className="flex flex-col items-center gap-3 p-6 rounded-xl border border-destructive/20 bg-destructive/5 text-center">
          <AlertCircle size={24} className="text-destructive" />
          <p className="text-sm text-destructive font-medium">{error}</p>
          <Button size="sm" variant="outline" onClick={() => window.location.reload()}>
            {t('tasks:error_try_again', 'Try Again')}
          </Button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-3">
              <Skeleton className="h-8 w-8 rounded-md" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-8 w-20 rounded-md" />
            </div>
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && !error && filteredDatasets.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-12 text-muted-foreground">
          <Database size={32} className="text-muted-foreground/40" />
          <p className="text-sm">
            {t('tasks:create.no_datasets', 'No datasets available.')}
          </p>
        </div>
      )}

      {/* Dataset Table */}
      {!loading && filteredDatasets.length > 0 && (
        <div className="rounded-xl border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  {t('tasks:create.dataset_table.name', 'Dataset Name')}
                </TableHead>
                <TableHead className="hidden sm:table-cell w-24">
                  {t('tasks:create.dataset_table.images', 'Images')}
                </TableHead>
                <TableHead className="hidden md:table-cell w-32">
                  {t('tasks:create.dataset_table.version', 'Version')}
                </TableHead>
                <TableHead className="w-[90px] text-right" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDatasets.map((ds) => {
                const isSelected = selectedId === ds.id;
                return (
                  <TableRow key={ds.id} className={isSelected ? 'bg-primary/5' : undefined}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Database size={16} className="text-muted-foreground shrink-0" />
                        <div>
                          <p className="font-medium text-sm">{ds.name}</p>
                          {ds.description && (
                            <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                              {ds.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge variant="secondary" className="gap-1 text-xs">
                        <ImageIcon size={11} />
                        {ds.total_images ?? '—'}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                      {ds.current_version || '—'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant={isSelected ? 'secondary' : 'outline'}
                        onClick={() => onSelect(ds)}
                        className="h-8 min-w-[68px] text-xs"
                      >
                        {isSelected ? (
                          <>
                            <CheckCircle2 size={12} className="mr-1" />
                            {t('tasks:create.dataset_table.selected', 'Selected')}
                          </>
                        ) : (
                          t('tasks:create.dataset_table.select', 'Select')
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default DatasetSelectionStep;
