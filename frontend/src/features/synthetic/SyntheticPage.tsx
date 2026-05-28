// frontend/src/features/synthetic/SyntheticPage.tsx
import { useEffect } from 'react';
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

  // Keyboard shortcuts
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

      // Arrow Left: Previous image
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (currentIndex > 0) {
          store.setActiveImage(store.images[currentIndex - 1].id);
        }
      }

      // Arrow Right: Next image
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (currentIndex < store.images.length - 1) {
          store.setActiveImage(store.images[currentIndex + 1].id);
        }
      }

      // K: Keep (open save dialog)
      if (e.key.toLowerCase() === 'k') {
        e.preventDefault();
        const activeImage = store.getActiveImage();
        if (activeImage) {
          store.openSaveDialog(activeImage);
        }
      }

      // D: Discard (remove image)
      if (e.key.toLowerCase() === 'd') {
        e.preventDefault();
        if (store.activeImageId) {
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
                <h1 className="text-base font-bold text-foreground">Synthetic Generation Studio</h1>
        </div>
              <span className="hidden sm:inline text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full border border-border">
                Bring Your Own Key
              </span>
      </div>
            <ModelSelector />
    </div>
        </div>

        {/* Main Workspace - Resizable Panels */}
        <div className="flex-1 min-h-0">
          <ResizablePanelGroup direction="horizontal" className="h-full rounded-xl border border-border overflow-hidden bg-card shadow-sm">
            {/* Left Panel: Chat */}
            <ResizablePanel defaultSize={30} minSize={20} maxSize={45}>
              <GenerationChat />
            </ResizablePanel>

            <ResizableHandle withHandle />

            {/* Right Panel: Image Viewer + Preview Strip */}
            <ResizablePanel defaultSize={70} minSize={55}>
              <ResizablePanelGroup direction="horizontal" className="h-full">
                {/* Main Image Viewer */}
                <ResizablePanel defaultSize={85} minSize={60}>
                  <ImageViewer />
                </ResizablePanel>

                <ResizableHandle withHandle />

                {/* Vertical Preview Strip */}
                <ResizablePanel defaultSize={15} minSize={10} maxSize={25}>
                  <ImagePreviewStrip />
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