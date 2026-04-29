import { cn } from '@/lib/utils';
import type { TaskImage, AnnotationStatus } from '../../types/annotation.types';

interface ImageQueueItemProps {
  image: TaskImage;
  isActive: boolean;
  onClick: () => void;
}

const STATUS_CONFIG: Record<
  AnnotationStatus,
  { label: string; dotClass: string; badgeVariant: 'default' | 'secondary' | 'outline' | 'destructive' }
> = {
  UPLOADED: {
    label: 'Uploaded',
    dotClass: 'bg-emerald-500',
    badgeVariant: 'outline',
  },
  PENDING: {
    label: 'Pending',
    dotClass: 'bg-amber-400',
    badgeVariant: 'secondary',
  },
  VERIFICATION_FAILED: {
    label: 'Ver. Failed',
    dotClass: 'bg-destructive',
    badgeVariant: 'destructive',
  },
  FAILED: {
    label: 'Failed',
    dotClass: 'bg-red-600',
    badgeVariant: 'destructive',
  },
};

export default function ImageQueueItem({ image, isActive, onClick }: ImageQueueItemProps) {
  const config = STATUS_CONFIG[image.status];

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
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', config.dotClass)} />
          <span className="text-[10px] text-muted-foreground">{config.label}</span>
        </div>
      </div>
    </button>
  );
}
