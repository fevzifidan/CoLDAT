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
  const { datasetId, imageId } = useParams<{ datasetId: string; imageId: string }>();
  const navigate = useNavigate();
  
  const { 
    currentImageIndex, 
    totalImages, 
    setReadOnly,
    setActiveTool
  } = useAppStore();
  
  // Set read-only mode on mount and revert on unmount
  useEffect(() => {
    setReadOnly(true);
    setActiveTool('select');
    return () => setReadOnly(false);
  }, [setReadOnly, setActiveTool]);

  const { classes, relationTypes, isLoadingAnnotations } = useAnnotationData(imageId ?? '');

  const [activeImageId, setActiveImageId] = useState(imageId ?? '');
  
  // Sync activeImageId when URL imageId changes
  useEffect(() => {
    if (imageId) {
      setActiveImageId(imageId);
    }
  }, [imageId]);

  const handleImageSelect = (id: string) => {
    setActiveImageId(id);
    navigate(`/view/${datasetId}/${id}`);
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
          taskId={datasetId ?? ''} // Assuming LeftPanel can handle datasetId as taskId for now or works similarly
          totalImages={totalImages}
          activeImageId={activeImageId}
          onImageSelect={handleImageSelect}
        />
      }
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
