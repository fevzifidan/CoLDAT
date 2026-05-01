import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
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
import { Button } from '@/components/ui/button';

interface AnnotatedObjectsListProps {
  objects: AnnotatedObject[];
}

export default function AnnotatedObjectsList({ objects }: AnnotatedObjectsListProps) {
  const selectedObjectId = useAppStore(state => state.selectedObjectId);
  const setSelectedObjectId = useAppStore(state => state.setSelectedObjectId);
  const updateObject = useAppStore(state => state.updateObject);
  const deleteObject = useAppStore(state => state.deleteObject);
  const isReadOnly = useAppStore(state => state.isReadOnly);

  const { t } = useTranslation('annotation');

  return (
    <div className="px-4 py-3 border-b">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">
        {t('rightPanel.overview.annotatedObjects')}
      </p>

      <div className="space-y-1">
        {objects.map((obj) => (
          <ContextMenu key={obj.id}>
            <ContextMenuTrigger asChild>
              <div
                role="button"
                tabIndex={0}
                onClick={() => setSelectedObjectId(obj.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    setSelectedObjectId(obj.id);
                  }
                }}
                onContextMenu={() => setSelectedObjectId(obj.id)}
                className={cn(
                  'group relative w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-all border cursor-pointer select-none',
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
                
                <div className="flex items-center gap-1">
                  {obj.locked && <Lock className="w-3 h-3 text-muted-foreground/70" />}
                  {!obj.visible && (
                    <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-tighter">
                      {t('rightPanel.overview.hidden')}
                    </span>
                  )}
                  
                  {!isReadOnly && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 h-6 w-6 text-muted-foreground hover:text-destructive transition-all"
                      title={t('rightPanel.inspector.objectHeader.delete')}
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteObject(obj.id);
                      }}
                    >
                      <Trash2 size={12} />
                    </Button>
                  )}
                </div>
              </div>
            </ContextMenuTrigger>
            <ContextMenuContent className="w-48">
              <ContextMenuItem 
                onClick={() => updateObject(obj.id, { visible: !obj.visible })}
                className="gap-2"
              >
                {obj.visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {obj.visible ? t('rightPanel.contextMenu.hideObject') : t('rightPanel.contextMenu.showObject')}
              </ContextMenuItem>
              {!isReadOnly && (
                <>
                  <ContextMenuItem 
                    onClick={() => updateObject(obj.id, { locked: !obj.locked })}
                    className="gap-2"
                  >
                    {obj.locked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                    {obj.locked ? t('rightPanel.contextMenu.unlockObject') : t('rightPanel.contextMenu.lockObject')}
                  </ContextMenuItem>
                  <ContextMenuSeparator />
                  <ContextMenuItem 
                    onClick={() => deleteObject(obj.id)}
                    className="gap-2 text-destructive focus:text-destructive focus:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4" />
                    {t('rightPanel.contextMenu.deleteObject')}
                  </ContextMenuItem>
                </>
              )}
            </ContextMenuContent>
          </ContextMenu>
        ))}

        {objects.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-3 italic">
            {t('rightPanel.overview.noAnnotations')}
          </p>
        )}
      </div>
    </div>
  );
}
