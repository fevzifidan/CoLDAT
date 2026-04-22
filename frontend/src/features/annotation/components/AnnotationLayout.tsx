import { ReactNode } from 'react';
import { useAppStore } from '@/store/hooks/useAppStore';
import { Button } from '@/components/ui/button';
import { PanelLeft, PanelRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AnnotationLayoutProps {
  leftPanel: ReactNode;
  toolPanel?: ReactNode;
  canvas: ReactNode;
  rightPanel: ReactNode;
  toolbar: ReactNode;
}

/**
 * 3-column annotation layout with a split left sidebar:
 * [ [Queue 280px] | [Tools 56px] ] | [Canvas flex-1] | [RightPanel 320px]
 * with a top toolbar spanning full width.
 */
export default function AnnotationLayout({
  leftPanel,
  toolPanel,
  canvas,
  rightPanel,
  toolbar,
}: AnnotationLayoutProps) {
  const { 
    leftPanelCollapsed, setLeftPanelCollapsed,
    rightPanelCollapsed, setRightPanelCollapsed 
  } = useAppStore();

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      {/* Top Toolbar */}
      <div className="shrink-0 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        {toolbar}
      </div>

      {/* Main content area */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left container (Queue + Tools) */}
        <div className="flex shrink-0 border-r overflow-hidden h-full">
          {/* Dataset Queue */}
          <aside 
            className={cn(
              "shrink-0 bg-card flex flex-col overflow-hidden border-r transition-all duration-300 ease-in-out",
              leftPanelCollapsed ? "w-0 border-r-0" : "w-[280px]"
            )}
          >
            <div className="w-[280px] h-full flex flex-col">
              {leftPanel}
            </div>
          </aside>

          {/* Tools Panel */}
          {toolPanel && (
            <aside className="w-14 shrink-0 bg-background flex flex-col overflow-hidden">
              {toolPanel}
            </aside>
          )}
        </div>

        {/* Centre canvas */}
        <main className="flex-1 bg-muted/30 flex items-center justify-center overflow-hidden relative">
          {/* Collapse Toggle Buttons (Overlay) */}
          <div className="absolute left-2 top-2 z-10">
            <Button
              variant="secondary"
              size="icon"
              className="h-8 w-8 rounded-full shadow-md border"
              onClick={() => setLeftPanelCollapsed(!leftPanelCollapsed)}
            >
              <PanelLeft className={cn("h-4 w-4 transition-transform", leftPanelCollapsed && "rotate-180")} />
            </Button>
          </div>

          <div className="absolute right-2 top-2 z-10">
            <Button
              variant="secondary"
              size="icon"
              className="h-8 w-8 rounded-full shadow-md border"
              onClick={() => setRightPanelCollapsed(!rightPanelCollapsed)}
            >
              <PanelRight className={cn("h-4 w-4 transition-transform", rightPanelCollapsed && "rotate-180")} />
            </Button>
          </div>

          {canvas}
        </main>

        {/* Right panel */}
        <aside 
          className={cn(
            "shrink-0 border-l bg-card flex flex-col overflow-hidden transition-all duration-300 ease-in-out",
            rightPanelCollapsed ? "w-0 border-l-0" : "w-[320px]"
          )}
        >
          {rightPanel}
        </aside>
      </div>
    </div>
  );
}
