import { useState } from 'react';
import { useAnnotationStore } from './store/useAnnotationStore';
import { useAnnotationData } from './hooks/useAnnotationData';
import AnnotationLayout from './components/AnnotationLayout';
import AnnotationToolbar from './components/Toolbar/AnnotationToolbar';
import LeftPanel from './components/LeftPanel/LeftPanel';
import CanvasPlaceholder from './components/CanvasArea/CanvasPlaceholder';
import RightPanel from './components/RightPanel/RightPanel';

export default function AnnotationPage() {
  const { currentImageIndex, totalImages } = useAnnotationStore();
  const { classes, relationTypes, queue } = useAnnotationData();

  const [activeImageId, setActiveImageId] = useState(queue[0]?.id ?? '');

  return (
    <AnnotationLayout
      toolbar={
        <AnnotationToolbar
          projectName="Traffic Sign Detection"
          currentIndex={currentImageIndex}
          totalImages={totalImages}
        />
      }
      leftPanel={
        <LeftPanel
          queue={queue}
          totalImages={totalImages}
          activeImageId={activeImageId}
          onImageSelect={setActiveImageId}
        />
      }
      canvas={<CanvasPlaceholder />}
      rightPanel={
        <RightPanel classes={classes} relationTypes={relationTypes} />
      }
    />
  );
}
