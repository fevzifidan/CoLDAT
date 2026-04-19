import { cn } from '@/lib/utils';
import { useAnnotationStore } from '../../../store/useAnnotationStore';
import type { AnnotatedObject } from '../../../types/annotation.types';

interface AnnotatedObjectsListProps {
  objects: AnnotatedObject[];
}

export default function AnnotatedObjectsList({ objects }: AnnotatedObjectsListProps) {
  const { selectedObjectId, setSelectedObjectId } = useAnnotationStore();

  return (
    <div className="px-4 py-3 border-b">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">
        Annotated Objects
      </p>

      <div className="space-y-1">
        {objects.map((obj) => (
          <button
            key={obj.id}
            onClick={() => setSelectedObjectId(obj.id)}
            className={cn(
              'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-all border',
              'hover:bg-accent hover:text-accent-foreground',
              selectedObjectId === obj.id
                ? 'border-primary/30 bg-primary/8 text-primary font-semibold'
                : 'border-border/50 bg-card'
            )}
          >
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: obj.color }}
            />
            <span className="flex-1 text-left font-medium">{obj.label}</span>
            {!obj.visible && (
              <span className="text-[9px] text-muted-foreground uppercase">hidden</span>
            )}
          </button>
        ))}

        {objects.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-3">
            No annotations yet
          </p>
        )}
      </div>
    </div>
  );
}
