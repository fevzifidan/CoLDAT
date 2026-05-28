// frontend/src/features/synthetic/components/ImagePreviewStrip.tsx

import { useSyntheticStore } from '../store/syntheticSlice';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ImageIcon, Loader2, XCircle } from 'lucide-react';

export default function ImagePreviewStrip() {
  const { images, activeImageId, setActiveImage, removeImage, isGenerating } = useSyntheticStore();

  return (
    <div className="flex flex-col h-full border-l border-border bg-muted/10">
      {/* Header */}
      <div className="shrink-0 px-2.5 py-2 border-b border-border bg-muted/20">
        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
          Görseller ({images.length})
        </p>
      </div>

      {/* Preview List */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-2">
          {images.length === 0 && !isGenerating && (
            <div className="flex flex-col items-center gap-1.5 py-8 text-muted-foreground">
              <ImageIcon size={20} className="opacity-30" />
              <span className="text-[10px]">Henüz görsel yok</span>
            </div>
          )}

          {isGenerating && (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
            </div>
          )}

          {images.map((image) => (
            <div key={image.id} className="relative group">
              <button
                onClick={() => setActiveImage(image.id)}
                className={`w-full aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                  activeImageId === image.id
                    ? 'border-primary ring-1 ring-primary'
                    : 'border-border hover:border-muted-foreground/30'
                }`}
              >
                {image.thumbnailUrl ? (
                  <img
                    src={image.thumbnailUrl}
                    alt={image.prompt}
                    className="w-full h-full object-cover"
                    draggable={false}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted">
                    <ImageIcon size={16} className="text-muted-foreground/50" />
                  </div>
                )}
              </button>

              {/* Remove button (discard) */}
              <button
                onClick={() => removeImage(image.id)}
                className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground rounded-full 
                           flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                title="Discard (Sil)"
              >
                <XCircle size={12} />
              </button>

              {/* Active indicator dot */}
              {activeImageId === image.id && (
                <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-primary" />
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
