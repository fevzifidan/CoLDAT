

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import DatasetQueueHeader from './DatasetQueueHeader';
import ImageQueueItem from './ImageQueueItem';
import QueuePagination from './QueuePagination';
import { useImagePagination } from './hooks/usePagination';

interface LeftPanelProps {
  taskId: string;
  totalImages: number;
  activeImageId: string;
  onImageSelect: (id: string) => void;
}

export default function LeftPanel({
  taskId,
  totalImages,
  activeImageId,
  onImageSelect,
}: LeftPanelProps) {
  const { t } = useTranslation('annotation');
  const [search, setSearch] = useState('');

  const {
    images,
    loading,
    currentPage,
    hasNext,
    handleNext,
    handlePrevious
  } = useImagePagination(taskId, 50);

  const filtered = images.filter((img) =>
    img.filename.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-background border-r">
      <DatasetQueueHeader totalImages={totalImages} />

      {/* Search */}
      <div className="px-3 py-2 border-b shrink-0">
        <div className="relative">
          <Search
            size={13}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('leftPanel.search')}
            className="h-7 pl-7 text-xs bg-muted/40 border-transparent focus-visible:border-input"
          />
        </div>
      </div>

      {/* Image list */}
      <ScrollArea className="flex-1">
        {loading ? (
          <div className="p-2 space-y-0.5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-center gap-2 px-2 py-1.5 rounded-md">
                {/* Thumbnail skeleton */}
                <Skeleton className="h-10 w-10 rounded flex-shrink-0" />
                {/* Text skeleton */}
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-2.5 w-3/4 rounded" />
                  <Skeleton className="h-2 w-1/2 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-2 space-y-0.5">
            {filtered.map((img) => (
              <ImageQueueItem
                key={img.asset_id}
                image={img}
                isActive={img.asset_id === activeImageId}
                onClick={() => onImageSelect(img.asset_id)}
              />
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Pagination - Listenin Altına Sabitlendi */}
      <QueuePagination
        currentPage={currentPage}
        hasNext={hasNext}
        onNext={handleNext}
        onPrev={handlePrevious}
        disabled={loading}
      />
    </div>
  );
}