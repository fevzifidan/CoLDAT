import { ListFilter } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DatasetQueueHeaderProps {
  totalImages: number;
}

export default function DatasetQueueHeader({ totalImages }: DatasetQueueHeaderProps) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b shrink-0">
      <div>
        <h2 className="text-sm font-semibold">Task Queue</h2>
        <p className="text-[10px] text-muted-foreground mt-0.5">
          42 / {totalImages.toLocaleString()} images
        </p>
      </div>
      <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground">
        <ListFilter size={14} />
      </Button>
    </div>
  );
}
