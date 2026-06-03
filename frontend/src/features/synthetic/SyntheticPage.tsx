// frontend/src/features/synthetic/SyntheticPage.tsx
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSyntheticStore } from './store/syntheticSlice';
import ModelSelector from './components/ModelSelector';
import GenerationChat from './components/GenerationChat';
import ImageViewer from './components/ImageViewer';
import ImagePreviewStrip from './components/ImagePreviewStrip';
import KeepDiscardControls from './components/KeepDiscardControls';
import SaveToProjectDialog from './components/SaveToProjectDialog';
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from '@/components/ui/resizable';
import { Sparkles } from 'lucide-react';

export default function SyntheticPage() {
  const { t } = useTranslation(['synthetic']);

  // Keyboard shortcuts (multi-select aware)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if typing in an input
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA' ||
        document.activeElement?.getAttribute('contenteditable') === 'true'
      )
        return;

      const store = useSyntheticStore.getState();
      const currentIndex = store.images.findIndex((img) => img.id === store.activeImageId);
      const hasMultiSelection = store.selectedImageIds.length > 1;

      // Arrow Left: Previous image
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (currentIndex > 0) {
          store.deselectAllImages();
          store.setActiveImage(store.images[currentIndex - 1].id);
        }
      }

      // Arrow Right: Next image
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (currentIndex < store.images.length - 1) {
          store.deselectAllImages();
          store.setActiveImage(store.images[currentIndex + 1].id);
        }
      }

      // K: Keep (multi-select aware)
      if (e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (hasMultiSelection) {
          const selectedImages = store.images.filter((img) =>
            store.selectedImageIds.includes(img.id)
          );
          if (selectedImages.length > 0) {
            store.openBulkSaveDialog(selectedImages);
          }
        } else {
          const activeImage = store.getActiveImage();
          if (activeImage) {
            store.openSaveDialog(activeImage);
          }
        }
      }

      // D: Discard (multi-select aware)
      if (e.key.toLowerCase() === 'd') {
        e.preventDefault();
        if (hasMultiSelection) {
          store.bulkRemoveImages(store.selectedImageIds);
        } else if (store.activeImageId) {
          store.removeImage(store.activeImageId);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  return (
    <>
      <SaveToProjectDialog />

      <div className="flex flex-col h-[calc(100vh-4rem)] max-w-[1600px] mx-auto p-4 gap-3">
        {/* Top Bar - Model Selector & API Key Area */}
        <div className="shrink-0 bg-card border border-border rounded-xl p-3 shadow-sm">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                                <h1 className="text-base font-bold text-foreground">{t('page.title')}</h1>
              </div>
              <span className="hidden sm:inline text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full border border-border">
                {t('page.byokBadge')}
              </span>
            </div>
            <ModelSelector />
          </div>
        </div>

        {/* Main Workspace - Resizable Panels */}
        <div className="flex-1 min-h-0">
          <ResizablePanelGroup id="synthetic-main-group" direction="horizontal" className="h-full w-full rounded-xl border border-border bg-card shadow-sm">
            {/* Left Panel: Chat */}
            <ResizablePanel id="synthetic-chat-panel" defaultSize="35%" minSize="22%" maxSize="50%">
              <div className="h-full w-full">
                <GenerationChat />
              </div>
            </ResizablePanel>

            <ResizableHandle withHandle />

            {/* Right Panel: Image Viewer + Preview Strip */}
            <ResizablePanel id="synthetic-right-panel" defaultSize="65%" minSize="50%">
              <ResizablePanelGroup id="synthetic-viewer-group" direction="horizontal" className="h-full w-full">
                {/* Main Image Viewer */}
                <ResizablePanel id="synthetic-image-viewer" defaultSize="82%" minSize="10%">
                  <div className="h-full w-full">
                    <ImageViewer />
                  </div>
                </ResizablePanel>

                <ResizableHandle withHandle />

                {/* Vertical Preview Strip */}
                <ResizablePanel id="synthetic-preview-strip" defaultSize="18%" minSize="12%" maxSize="30%">
                  <div className="h-full w-full">
                    <ImagePreviewStrip />
                  </div>
                </ResizablePanel>
              </ResizablePanelGroup>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>

        {/* Bottom Controls: Keep / Discard / Navigation */}
        <KeepDiscardControls />
      </div>
    </>
  );
}