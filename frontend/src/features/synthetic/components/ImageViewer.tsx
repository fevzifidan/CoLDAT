// frontend/src/features/synthetic/components/ImageViewer.tsx

import { useSyntheticStore } from '../store/syntheticSlice';
import { ImageIcon, Loader2, ZoomIn, ZoomOut, RotateCw, SlidersHorizontal } from 'lucide-react';

export default function ImageViewer() {
  const {
    getActiveImage,
    zoom,
    rotation,
    filters,
    setZoom,
    setRotation,
    resetViewer,
    isGenerating,
  } = useSyntheticStore();

  const activeImage = getActiveImage();

  const computedFilterString = `
    ${filters.invert ? 'invert(1)' : 'invert(0)'}
    ${filters.grayscale ? 'grayscale(1)' : 'grayscale(0)'}
    ${filters.sepia ? 'sepia(1)' : 'sepia(0)'}
    blur(${filters.blur}px)
    brightness(${filters.brightness}%)
    contrast(${filters.contrast}%)
  `
    .trim()
    .replace(/\s+/g, ' ');

  const hasActiveFilters =
    filters.invert || filters.grayscale || filters.sepia || filters.blur > 0 || zoom !== 1 || rotation !== 0;

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      if (e.deltaY < 0) {
        setZoom(zoom + 0.1);
      } else {
        setZoom(zoom - 0.1);
      }
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="shrink-0 px-3 py-2 bg-muted/30 border-b border-border flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground truncate min-w-0">
          <ImageIcon size={14} className="shrink-0 text-primary" />
          <span className="truncate">
            {activeImage
              ? `"${activeImage.prompt.substring(0, 60)}${activeImage.prompt.length > 60 ? '...' : ''}"`
              : 'Henüz görsel yok'}
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => setZoom(zoom + 0.2)}
            className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition"
            title="Yakınlaştır (Ctrl+Scroll Up)"
          >
            <ZoomIn size={14} />
          </button>
          <button
            onClick={() => setZoom(zoom - 0.2)}
            className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition"
            title="Uzaklaştır (Ctrl+Scroll Down)"
          >
            <ZoomOut size={14} />
          </button>
          <button
            onClick={() => setRotation(90)}
            className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition"
            title="90° Döndür"
          >
            <RotateCw size={14} />
          </button>
          <button
            onClick={resetViewer}
            className="px-1.5 py-0.5 text-[10px] bg-muted hover:bg-muted/80 text-muted-foreground rounded transition font-medium"
            title="Sıfırla"
          >
            Reset
          </button>

          <span className="w-px h-4 bg-border mx-1" />

          <span className="text-[10px] text-muted-foreground font-mono">
            {zoom.toFixed(1)}x
          </span>
        </div>
      </div>

      {/* Canvas */}
      <div
        className="flex-1 bg-muted/50 flex items-center justify-center relative overflow-hidden"
        onWheel={handleWheel}
      >
        {isGenerating && !activeImage && (
          <div className="flex flex-col items-center gap-3 text-muted-foreground animate-pulse">
            <Loader2 size={36} className="animate-spin text-primary" />
            <span className="text-sm font-mono">Görsel oluşturuluyor...</span>
          </div>
        )}

        {!isGenerating && !activeImage && (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <ImageIcon size={40} className="opacity-30" />
            <span className="text-xs font-mono">Henüz görsel üretilmedi</span>
            <span className="text-[10px] text-muted-foreground/60">
              Bir prompt yazın ve Gönder'e tıklayın
            </span>
          </div>
        )}

        {activeImage && (
          <div
            className="w-full h-full flex items-center justify-center transition-transform duration-200 p-4"
            style={{ transform: `scale(${zoom}) rotate(${rotation}deg)` }}
          >
            {activeImage.status === 'completed' && (
              <img
                src={activeImage.dataUrl}
                alt={activeImage.prompt}
                style={{ filter: computedFilterString }}
                className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                draggable={false}
              />
            )}
            {activeImage.status === 'failed' && (
              <div className="text-center text-destructive">
                <p className="text-sm font-medium">Görsel yüklenemedi</p>
                <p className="text-xs mt-1">{activeImage.error}</p>
              </div>
            )}
          </div>
        )}

        {/* Active Filters Indicator */}
        {hasActiveFilters && activeImage && (
          <div className="absolute bottom-3 left-3 bg-background/80 backdrop-blur-sm text-[10px] text-muted-foreground font-mono px-2 py-1 rounded border border-border flex items-center gap-1.5 pointer-events-none">
            <SlidersHorizontal size={10} />
            <span>
              Rot: {rotation}° | Zoom: {zoom.toFixed(1)}x
              {filters.invert ? ' | Invert' : ''}
              {filters.grayscale ? ' | Grayscale' : ''}
              {filters.sepia ? ' | Sepia' : ''}
              {filters.blur > 0 ? ` | Blur(${filters.blur}px)` : ''}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
