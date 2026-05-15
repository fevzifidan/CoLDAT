import { useTranslation } from 'react-i18next';
import { useAppStore } from '../../../store/hooks/useAppStore';
import { cn } from '@/lib/utils';

export function SamActionHintBox() {
  const { t } = useTranslation('annotation');
  const activeTool = useAppStore(state => state.activeTool);
  const samMaskData = useAppStore(state => state.samMaskData);
  const samWarning = useAppStore(state => state.samWarning);

  // Box is visible when there's a warning, OR when SAM tool is active and a mask is generated
  const isVisible = !!samWarning || (activeTool === 'sam' && !!samMaskData);

  return (
    <div
      className={cn(
        "pointer-events-none transition-all duration-500 ease-in-out",
        "bg-background/40 backdrop-blur-sm border border-border/30 rounded-md px-3 py-2",
        "text-xs font-medium tracking-wide shadow-sm",
        samWarning ? "text-destructive/90" : "text-muted-foreground/90",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
      )}
    >
      {samWarning ? t(samWarning as any) : t('sam.actionHint')}
    </div>
  );
}
