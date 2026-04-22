import { cn } from '@/lib/utils';
import { useAppStore } from '../../../../../store/hooks/useAppStore';
import type { AnnotatedObject } from '../../../types/annotation.types';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
} from "@/components/ui/context-menu";
import { Eye, EyeOff, Lock, Unlock, Trash2 } from 'lucide-react';

interface AnnotatedObjectsListProps {
  objects: AnnotatedObject[];
}

export default function AnnotatedObjectsList({ objects }: AnnotatedObjectsListProps) {
  const { 
    selectedObjectId, 
    setSelectedObjectId, 
    updateObject, 
    deleteObject 
  } = useAppStore();

  return (
    <div className="px-4 py-3 border-b">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">
        Annotated Objects
      </p>

      <div className="space-y-1">
        {objects.map((obj) => (
          <ContextMenu key={obj.id}>
            <ContextMenuTrigger asChild>
              <button
                onClick={() => setSelectedObjectId(obj.id)}
                onContextMenu={() => setSelectedObjectId(obj.id)}
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
                {obj.locked && <Lock className="w-3 h-3 text-muted-foreground/70" />}
                {!obj.visible && (
                  <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-tighter">hidden</span>
                )}
              </button>
            </ContextMenuTrigger>
            <ContextMenuContent className="w-48">
              <ContextMenuItem 
                onClick={() => updateObject(obj.id, { visible: !obj.visible })}
                className="gap-2"
              >
                {obj.visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {obj.visible ? 'Hide Object' : 'Show Object'}
              </ContextMenuItem>
              <ContextMenuItem 
                onClick={() => updateObject(obj.id, { locked: !obj.locked })}
                className="gap-2"
              >
                {obj.locked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                {obj.locked ? 'Unlock Object' : 'Lock Object'}
              </ContextMenuItem>
              <ContextMenuSeparator />
              <ContextMenuItem 
                onClick={() => deleteObject(obj.id)}
                className="gap-2 text-destructive focus:text-destructive focus:bg-destructive/10"
              >
                <Trash2 className="w-4 h-4" />
                Delete Object
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        ))}

        {objects.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-3 italic">
            No annotations yet
          </p>
        )}
      </div>
    </div>
  );
}
