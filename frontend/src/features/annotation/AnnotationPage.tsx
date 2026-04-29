import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/hooks/useAppStore';
import { useAnnotationData } from './hooks/useAnnotationData';
import { useAnnotationAutoSave } from './hooks/useAnnotationAutoSave';
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
  
  useUndoRedo();
  const { classes, relationTypes, isLoadingAnnotations } = useAnnotationData(imageId ?? '');
  const { isSaving, saveNow } = useAnnotationAutoSave(imageId ?? '');
  useAnnotationHotkeys({ onSave: saveNow });

  const [activeImageId, setActiveImageId] = useState(imageId ?? '');
  
  // Future toggle for view-only mode
  const [isViewOnly] = useState(false);

  // Sync activeImageId when URL imageId changes
  useEffect(() => {
    if (imageId) {
      setActiveImageId(imageId);
    }
  }, [imageId]);

  const handleImageSelect = (id: string) => {
    setActiveImageId(id);
    navigate(`/annotate/${taskId}/${id}`);
  };

  return (
    <AnnotationLayout
      toolbar={
        <AnnotationToolbar
          projectName="Traffic Sign Detection"
          currentIndex={currentImageIndex}
          totalImages={totalImages}
          onSave={saveNow}
          isSaving={isSaving}
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
      toolPanel={!isViewOnly && <AnnotationSideToolbar />}
      canvas={
        <CanvasContainer 
          imageUrl="https://images.unsplash.com/photo-1542362567-b07e54358753?q=80&w=3446&auto=format&fit=crop" 
        />
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
