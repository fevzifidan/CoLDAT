import { Crosshair } from 'lucide-react';

export default function CanvasPlaceholder() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-4 select-none">
      {/* Dashed border box */}
      <div
        className="
          relative w-[85%] max-w-3xl h-[75%] max-h-[540px]
          border-2 border-dashed border-border/60
          rounded-xl bg-background/40
          flex flex-col items-center justify-center gap-3
          shadow-inner
        "
      >
        {/* Corner decorations */}
        <span className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-primary/60 rounded-tl" />
        <span className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-primary/60 rounded-tr" />
        <span className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-primary/60 rounded-bl" />
        <span className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-primary/60 rounded-br" />

        <div className="rounded-full p-4 bg-muted/60">
          <Crosshair size={32} className="text-muted-foreground/60" strokeWidth={1.5} />
        </div>

        <div className="text-center">
          <p className="text-sm font-semibold text-foreground/70">Annotation Canvas</p>
          <p className="text-xs text-muted-foreground mt-1">
            Coming soon — interactive labeling area
          </p>
        </div>

        {/* Grid overlay */}
        <div
          className="absolute inset-0 rounded-xl opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(var(--foreground) 1px, transparent 1px), linear-gradient(90deg, var(--foreground) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
      </div>
    </div>
  );
}
