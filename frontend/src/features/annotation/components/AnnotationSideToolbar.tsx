import {
  MousePointer2,
  Square,
  Share2,
  CircleDot,
  Pencil,
  Eraser,
  Magnet,
  Wand2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/hooks/useAppStore';
import { useTranslation } from 'react-i18next';

export type SideToolId = 'select' | 'bbox' | 'polygon' | 'points' | 'pen' | 'eraser' | 'livewire' | 'sam';

interface ToolItem {
  id: SideToolId;
  icon: any;
  label: string;
}

const TOOLS: ToolItem[] = [
  { id: 'select', icon: MousePointer2, label: 'Select (V)' },
  { id: 'bbox', icon: Square, label: 'Rectangle (R)' },
  { id: 'polygon', icon: Share2, label: 'Polygon (P)' },
  { id: 'points', icon: CircleDot, label: 'Points (K)' },
  { id: 'pen', icon: Pencil, label: 'Pen (B)' },
  { id: 'eraser', icon: Eraser, label: 'Eraser (E)' },
  { id: 'livewire', icon: Magnet, label: 'Livewire (L)' },
  { id: 'sam', icon: Wand2, label: 'SAM (S)' },
];

export default function AnnotationSideToolbar() {
  const activeTool = useAppStore(state => state.activeTool);
  const setActiveTool = useAppStore(state => state.setActiveTool);
  const { t } = useTranslation('annotation');

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex flex-col items-center py-4 gap-2 h-full bg-background/50">
        {TOOLS.map((tool) => (
          <Tooltip key={tool.id}>
            <TooltipTrigger asChild>
              <Button
                variant={activeTool === tool.id ? 'secondary' : 'ghost'}
                size="icon"
                className={cn(
                  "h-10 w-10 transition-colors",
                  activeTool === tool.id
                    ? "bg-primary/10 text-primary hover:bg-primary/20"
                    : "text-muted-foreground hover:text-foreground"
                )}
                onClick={() => setActiveTool(tool.id as any)}
              >
                <tool.icon className={cn(
                  "h-5 w-5",
                  activeTool === tool.id ? "stroke-[2.5px]" : "stroke-[1.5px]"
                )} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={10}>
              <p className="font-medium">{t(`sideToolbar.${tool.id}`)}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
}
