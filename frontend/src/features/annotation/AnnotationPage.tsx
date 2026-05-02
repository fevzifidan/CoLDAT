import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/hooks/useAppStore';
import { useAnnotationData } from './hooks/useAnnotationData';
import { useAnnotationAutoSave } from './hooks/useAnnotationAutoSave';
import { useTaskLifecycle } from './hooks/useTaskLifecycle';
import AnnotationLayout from './components/AnnotationLayout';
import AnnotationToolbar from './components/Toolbar/AnnotationToolbar';
import LeftPanel from './components/LeftPanel/LeftPanel';
import { CanvasContainer } from '../viewer';
import { useUndoRedo } from './hooks/useUndoRedo';
import { useAnnotationHotkeys } from './hooks/useAnnotationHotkeys';
import RightPanel from './components/RightPanel/RightPanel';
import AnnotationSideToolbar from './components/AnnotationSideToolbar';

export default function AnnotationPage() {
  const { taskId, imageId } = useParams<{ taskId: string; imageId: string }>();
  const navigate = useNavigate();
  
  const currentImageIndex = useAppStore(state => state.currentImageIndex);
  const totalImages = useAppStore(state => state.totalImages);
  const isReadOnly = useAppStore(state => state.isReadOnly);
  const taskImages = useAppStore(state => state.taskImages);
  const currentImage = useAppStore(state => state.currentImage);
  const setCurrentImage = useAppStore(state => state.setCurrentImage);
  
  useUndoRedo();
  const { classes, relationTypes, isLoading, isLoadingAnnotations } = useAnnotationData(taskId ?? '', imageId ?? '');
  const { isSaving, saveNow } = useAnnotationAutoSave(imageId ?? '');
  const { isSubmitting, submitForApproval } = useTaskLifecycle(taskId ?? '');
  
  useAnnotationHotkeys({ onSave: saveNow });

  const [activeImageId, setActiveImageId] = useState(imageId ?? '');
  
  // Sync activeImageId when URL imageId changes
  useEffect(() => {
    if (imageId) {
      setActiveImageId(imageId);
      // Update currentImage metadata in store
      const imgMeta = taskImages.find(img => img.asset_id === imageId);
      if (imgMeta) {
        setCurrentImage(imgMeta);
      } else {
        // Fallback or fetch if not found
        // Since it's not found, we don't have the URL yet.
        // We could fetch it here if we had a single image details API.
      }
    }
  }, [imageId, taskImages, setCurrentImage]);

  const handleImageSelect = (id: string) => {
    setActiveImageId(id);
    navigate(`/annotate/${taskId}/${id}`);
  };

  if (isLoading && !isLoadingAnnotations) {
    return (
      <div className="flex h-screen items-center justify-center bg-background text-muted-foreground font-mono">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm animate-pulse">Initializing Workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <AnnotationLayout
      toolbar={
        <AnnotationToolbar
          projectName="CoLDAT Workspace"
          currentIndex={currentImageIndex}
          totalImages={totalImages}
          onSave={saveNow}
          isSaving={isSaving}
          onSubmit={submitForApproval}
          isSubmitting={isSubmitting}
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
      toolPanel={!isReadOnly && <AnnotationSideToolbar />}
      canvas={
        currentImage?.asset_url ? (
          <CanvasContainer imageUrl={currentImage.asset_url} />
        ) : (
          <div className="flex h-full items-center justify-center bg-background text-muted-foreground">
            <p className="text-xs">Loading image metadata...</p>
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
