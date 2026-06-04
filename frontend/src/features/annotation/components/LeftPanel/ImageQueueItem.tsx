import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '@/store/hooks/useAppStore';
import type { TaskImage, AnnotationStatus } from '../../types/annotation.types';

interface ImageQueueItemProps {
  image: TaskImage;
  isActive: boolean;
  onClick: () => void;
}

const STATUS_CONFIG: Record<
  AnnotationStatus,
  { key: string; dotClass: string; badgeVariant: 'default' | 'secondary' | 'outline' | 'destructive' }
> = {
  UPLOADED: {
    key: 'uploaded',
    dotClass: 'bg-emerald-500',
    badgeVariant: 'outline',
  },
  PENDING: {
    key: 'pending',
    dotClass: 'bg-amber-400',
    badgeVariant: 'secondary',
  },
  VERIFICATION_FAILED: {
    key: 'verFailed',
    dotClass: 'bg-destructive',
    badgeVariant: 'destructive',
  },
  FAILED: {
    key: 'failed',
    dotClass: 'bg-red-600',
    badgeVariant: 'destructive',
  },
};

export default function ImageQueueItem({ image, isActive, onClick }: ImageQueueItemProps) {
  const { t } = useTranslation('annotation');
  const isReadOnly = useAppStore(state => state.isReadOnly);
  const statusKey = image.status?.toUpperCase() as AnnotationStatus;
  const config = STATUS_CONFIG[statusKey] || {
    key: 'unknown',
    dotClass: 'bg-gray-400',
    badgeVariant: 'outline' as const,
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-150',
        'hover:bg-accent hover:text-accent-foreground',
        isActive
          ? 'bg-primary/10 text-primary border border-primary/20'
          : 'border border-transparent'
      )}
    >
      {/* Thumbnail */}
      <div className="w-10 h-10 shrink-0 rounded-md overflow-hidden bg-muted border">
        <img
          src={image.asset_url}
          alt={image.filename}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium truncate">{image.filename}</p>
        {!isReadOnly && (
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', config.dotClass)} />
            <span className="text-[10px] text-muted-foreground">{t(`leftPanel.status.${config.key}`)}</span>
          </div>
        )}
      </div>
    </button>
  );
}

