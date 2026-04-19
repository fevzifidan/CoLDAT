import type { ReactNode } from 'react';

interface AnnotationLayoutProps {
  leftPanel: ReactNode;
  canvas: ReactNode;
  rightPanel: ReactNode;
  toolbar: ReactNode;
}

/**
 * 3-column annotation layout:
 *  [LeftPanel 280px] | [Canvas flex-1] | [RightPanel 320px]
 * with a top toolbar spanning full width.
 */
export default function AnnotationLayout({
  leftPanel,
  canvas,
  rightPanel,
  toolbar,
}: AnnotationLayoutProps) {
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      {/* Top Toolbar */}
      <div className="shrink-0 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        {toolbar}
      </div>

      {/* Main 3-column area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel */}
        <aside className="w-[280px] shrink-0 border-r bg-card flex flex-col overflow-hidden">
          {leftPanel}
        </aside>

        {/* Centre canvas */}
        <main className="flex-1 bg-muted/30 flex items-center justify-center overflow-hidden">
          {canvas}
        </main>

        {/* Right panel */}
        <aside className="w-[320px] shrink-0 border-l bg-card flex flex-col overflow-hidden">
          {rightPanel}
        </aside>
      </div>
    </div>
  );
}
