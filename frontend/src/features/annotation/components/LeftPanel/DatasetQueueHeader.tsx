import { ListFilter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '@/store/hooks/useAppStore';

interface DatasetQueueHeaderProps {
  totalImages: number;
  activeImageIndex: number;
}

export default function DatasetQueueHeader({ totalImages, activeImageIndex }: DatasetQueueHeaderProps) {
  const { t } = useTranslation('annotation');
  const isReadOnly = useAppStore(state => state.isReadOnly);

  return (
    <div className="flex items-center justify-between px-4 py-3 border-b shrink-0">
      <div>
        <h2 className="text-sm font-semibold">
          {isReadOnly ? t('leftPanel.datasetQueue') : t('leftPanel.taskQueue')}
        </h2>
        <p className="text-[10px] text-muted-foreground mt-0.5">
          {t('leftPanel.imagesCount', { current: activeImageIndex + 1, total: totalImages.toLocaleString() })}
        </p>
      </div>
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-7 w-7 text-muted-foreground hover:text-foreground"
        title={t('leftPanel.filter')}
      >
        <ListFilter size={14} />
      </Button>
    </div>
  );
}
