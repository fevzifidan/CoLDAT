// frontend/src/features/synthetic/components/KeepDiscardControls.tsx

import { useTranslation } from 'react-i18next';
import { useSyntheticStore } from '../store/syntheticSlice';
import { Check, ArrowLeft, ArrowRight, Trash2, Layers } from 'lucide-react';

export default function KeepDiscardControls() {
  const { t } = useTranslation(['synthetic']);
  const {
    images,
    activeImageId,
    selectedImageIds,
    getActiveImage,
    removeImage,
    bulkRemoveImages,
    openSaveDialog,
    openBulkSaveDialog,
    deselectAllImages,
  } = useSyntheticStore();

  const currentIndex = images.findIndex((img) => img.id === activeImageId);
  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex < images.length - 1;
  const hasMultiSelection = selectedImageIds.length > 1;

  const handleKeep = () => {
    if (hasMultiSelection) {
      // Bulk save: seçili tüm görselleri kaydet
      const selectedImages = images.filter((img) => selectedImageIds.includes(img.id));
      openBulkSaveDialog(selectedImages);
      return;
    }

    const image = getActiveImage();
    if (!image) return;
    openSaveDialog(image);
  };

  const handleDiscard = () => {
    if (hasMultiSelection) {
      // Bulk discard: seçili tüm görselleri sil
      bulkRemoveImages(selectedImageIds);
      return;
    }

    if (!activeImageId) return;
    removeImage(activeImageId);
  };

  const handlePrev = () => {
    if (!canGoPrev || !activeImageId) return;
    const prevImage = images[currentIndex - 1];
    useSyntheticStore.getState().setActiveImage(prevImage.id);
  };

  const handleNext = () => {
    if (!canGoNext || !activeImageId) return;
    const nextImage = images[currentIndex + 1];
    useSyntheticStore.getState().setActiveImage(nextImage.id);
  };

  if (images.length === 0) {
    return null;
  }

  return (
    <div className="bg-background border border-border p-3 rounded-xl shadow-sm flex items-center justify-between gap-4">
      {/* Keyboard Shortcuts */}
      <div className="hidden lg:flex items-center gap-3 text-[10px] text-muted-foreground font-medium">
        <div className="flex items-center gap-1">
          <span className="px-1.5 py-0.5 rounded border border-border bg-muted text-foreground text-[10px] font-mono">
            ←
          </span>
          {t('controls.shortcut_prev')}
        </div>
        <div className="flex items-center gap-1">
          <span className="px-1.5 py-0.5 rounded border border-border bg-muted text-foreground text-[10px] font-mono">
            →
          </span>
          {t('controls.shortcut_next')}
        </div>
        <div className="flex items-center gap-1">
          <span className="px-1.5 py-0.5 rounded border border-border bg-muted text-foreground text-[10px] font-mono">
            K
          </span>
          {hasMultiSelection ? t('controls.keep_multi') : t('controls.keep_single')}
        </div>
        <div className="flex items-center gap-1">
          <span className="px-1.5 py-0.5 rounded border border-border bg-muted text-foreground text-[10px] font-mono">
            D
          </span>
          {hasMultiSelection ? t('controls.discard_multi') : t('controls.discard_single')}
        </div>
      </div>

      {/* Multi-selection info & clear */}
      {hasMultiSelection && (
        <div className="flex items-center gap-2">
          <Layers size={14} className="text-emerald-500" />
          <span className="text-xs font-medium text-emerald-500">
            {t('controls.multiSelected', { count: selectedImageIds.length })}
          </span>
          <button
            onClick={() => deselectAllImages()}
            className="text-[10px] text-muted-foreground hover:text-foreground underline"
          >
            {t('controls.clearMulti')}
          </button>
        </div>
      )}

      {/* Main Actions */}
      <div className="flex items-center gap-2">
        {/* Discard Button */}
        <button
          onClick={handleDiscard}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 border border-destructive/20 text-xs font-semibold transition active:scale-95"
        >
          <Trash2 size={15} />
          {hasMultiSelection ? `${t('controls.discard_button')} (${selectedImageIds.length})` : t('controls.discard_button')}
        </button>

        {/* Keep Button */}
        <button
          onClick={handleKeep}
          className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold transition shadow-sm active:scale-95"
        >
          <Check size={15} />
          {hasMultiSelection ? `${t('controls.keep_button')} (${selectedImageIds.length})` : t('controls.keep_button')}
        </button>
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-2">
        <button
          onClick={handlePrev}
          disabled={!canGoPrev}
          className="p-2 rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition"
        >
          <ArrowLeft size={16} />
        </button>

        <span className="text-xs font-mono font-bold text-muted-foreground bg-muted px-2.5 py-1.5 rounded-lg border border-border min-w-[60px] text-center">
          {currentIndex + 1} / {images.length}
        </span>

        <button
          onClick={handleNext}
          disabled={!canGoNext}
          className="p-2 rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition"
        >
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
