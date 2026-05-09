import { useEffect, useState } from 'react';
import { useAppStore } from '../../../store/hooks/useAppStore';
import { cn } from '@/lib/utils';

export function ActionStatusBox() {
  const lastAction = useAppStore(state => state.lastAction);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (lastAction) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 3000); // 3 seconds
      return () => clearTimeout(timer);
    }
  }, [lastAction]);

  if (!lastAction) return null;

  return (
    <div
      className={cn(
        "pointer-events-none transition-all duration-500 ease-in-out",
        "bg-background/40 backdrop-blur-sm border border-border/30 rounded-md px-2 py-1",
        "text-[10px] text-muted-foreground/80 font-medium tracking-wide",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
      )}
    >
      {lastAction.message}
    </div>
  );
}
