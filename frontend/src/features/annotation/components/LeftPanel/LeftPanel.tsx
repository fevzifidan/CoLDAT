// import { useState } from 'react';
// import { Search } from 'lucide-react';
// import { Input } from '@/components/ui/input';
// import { ScrollArea } from '@/components/ui/scroll-area';
// import DatasetQueueHeader from './DatasetQueueHeader';
// import ImageQueueItem from './ImageQueueItem';
// import type { QueueImage } from '../../types/annotation.types';

// interface LeftPanelProps {
//   queue: QueueImage[];
//   totalImages: number;
//   activeImageId: string;
//   onImageSelect: (id: string) => void;
// }

// export default function LeftPanel({
//   queue,
//   totalImages,
//   activeImageId,
//   onImageSelect,
// }: LeftPanelProps) {
//   const [search, setSearch] = useState('');

//   const filtered = queue.filter((img) =>
//     img.filename.toLowerCase().includes(search.toLowerCase())
//   );

//   return (
//     <>
//       <DatasetQueueHeader totalImages={totalImages} />

//       {/* Search */}
//       <div className="px-3 py-2 border-b shrink-0">
//         <div className="relative">
//           <Search
//             size={13}
//             className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
//           />
//           <Input
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//             placeholder="Search..."
//             className="h-7 pl-7 text-xs bg-muted/40 border-transparent focus-visible:border-input"
//           />
//         </div>
//       </div>

//       {/* Image list */}
//       <ScrollArea className="flex-1">
//         <div className="p-2 space-y-0.5">
//           {filtered.map((img) => (
//             <ImageQueueItem
//               key={img.id}
//               image={img}
//               isActive={img.id === activeImageId}
//               onClick={() => onImageSelect(img.id)}
//             />
//           ))}
//         </div>
//       </ScrollArea>
//     </>
//   );
// }


import { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import DatasetQueueHeader from './DatasetQueueHeader';
import ImageQueueItem from './ImageQueueItem';
import QueuePagination from './QueuePagination';
import { useImagePagination } from './hooks/usePagination';

interface LeftPanelProps {
  taskId: string; // Artık taskId alıyoruz
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
  const [search, setSearch] = useState('');

  // Custom hook ile data yönetimi
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
            placeholder="Search in current page..."
            className="h-7 pl-7 text-xs bg-muted/40 border-transparent focus-visible:border-input"
          />
        </div>
      </div>

      {/* Image list */}
      <ScrollArea className="flex-1">
        {loading ? (
          <div className="flex items-center justify-center h-20">
            <Loader2 className="animate-spin text-muted-foreground" size={18} />
          </div>
        ) : (
          <div className="p-2 space-y-0.5">
            {filtered.map((img) => (
              <ImageQueueItem
                key={img.asset_id} // API'den gelen asset_id
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