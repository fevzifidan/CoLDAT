import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/hooks/useAppStore';
import { useAnnotationData } from '../annotation/hooks/useAnnotationData';
import AnnotationLayout from '../annotation/components/AnnotationLayout';
import AnnotationToolbar from '../annotation/components/Toolbar/AnnotationToolbar';
import LeftPanel from '../annotation/components/LeftPanel/LeftPanel';
import { CanvasContainer } from './components/CanvasContainer';
import RightPanel from '../annotation/components/RightPanel/RightPanel';

export default function ViewerPage() {
  // K-1: Route parametresi ':taskId' olduğu için tip 'taskId' olarak düzeltildi.
  const { taskId, imageId } = useParams<{ taskId: string; imageId: string }>();
  const navigate = useNavigate();

  const {
    currentImageIndex,
    totalImages,
    setReadOnly,
    setActiveTool,
    taskImages,
    currentImage,
    setCurrentImage,
  } = useAppStore();

  // Set read-only mode on mount and revert on unmount
  useEffect(() => {
    setReadOnly(true);
    setActiveTool('select');
    return () => setReadOnly(false);
  }, [setReadOnly, setActiveTool]);

  // K-2: useAnnotationData, taskId ve imageId'nin her ikisiyle de çağrılıyor.
  // Metadata zinciri (task → dataset → taxonomy) ve annotation yüklemesi doğru çalışır.
  const { classes, relationTypes, isLoadingAnnotations } = useAnnotationData(taskId ?? '', imageId ?? '');

  const [activeImageId, setActiveImageId] = useState(imageId ?? '');

  // Sync activeImageId and currentImage when URL imageId changes
  useEffect(() => {
    if (imageId) {
      setActiveImageId(imageId);
      // D-4: LeftPanel tarafından doldurulan taskImages'tan aktif resmin URL'ini bul
      const imgMeta = taskImages.find(img => img.asset_id === imageId);
      if (imgMeta) {
        setCurrentImage(imgMeta);
      }
    }
  }, [imageId, taskImages, setCurrentImage]);

  const handleImageSelect = (id: string) => {
    setActiveImageId(id);
    navigate(`/view/${taskId}/${id}`);
  };

  return (
    <AnnotationLayout
      toolbar={
        <AnnotationToolbar
          projectName="Dataset Viewer"
          currentIndex={currentImageIndex}
          totalImages={totalImages}
        />
      }
      leftPanel={
        <LeftPanel
          taskId={taskId ?? ''}
          totalImages={totalImages}
          activeImageId={activeImageId}
          onImageSelect={handleImageSelect}
        />
      }
      canvas={
        // D-4: Hardcoded URL kaldırıldı; store'daki currentImage.asset_url kullanılıyor.
        currentImage?.asset_url ? (
          <CanvasContainer imageUrl={currentImage.asset_url} />
        ) : (
          <div className="flex h-full items-center justify-center bg-background text-muted-foreground">
            <p className="text-xs">Loading image...</p>
          </div>
        )
      }
      rightPanel={
        <RightPanel
          classes={classes}
          relationTypes={relationTypes}
          isLoading={isLoadingAnnotations}
        />
      }
    />
  );
}
