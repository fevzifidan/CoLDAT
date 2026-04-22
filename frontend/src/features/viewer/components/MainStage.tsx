import React, { useRef, useEffect } from 'react';
import { Stage } from 'react-konva';
import Konva from 'konva';
import { useAppStore } from '../../../store/hooks/useAppStore';
import { useZoom } from '../hooks/useZoom';
import { usePan } from '../hooks/usePan';
import { BackgroundLayer } from './BackgroundLayer';
import { AnnotationLayer } from '../../annotation/components/canvas/AnnotationLayer';
import { InteractionLayer } from '../../annotation/components/canvas/InteractionLayer';

interface MainStageProps {
  width: number;
  height: number;
  imageUrl: string;
}

export const MainStage: React.FC<MainStageProps> = ({ width, height, imageUrl }) => {
  const stageRef = useRef<Konva.Stage>(null);
  const { scale, stagePos } = useAppStore();
  const setSelectedObjectId = useAppStore(state => state.setSelectedObjectId);
  const activeTool = useAppStore(state => state.activeTool);

  const { handleWheel } = useZoom();
  const { isDraggable, handleMouseDown, handleMouseUp, handleDragEnd } = usePan();

  // Attach native non-passive wheel listener to prevent browser zoom
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const container = stage.container();
    
    const onWheel = (e: WheelEvent) => {
      handleWheel(e, stage);
    };

    container.addEventListener('wheel', onWheel, { passive: false });
    return () => container.removeEventListener('wheel', onWheel);
  }, [handleWheel]);

  // Handle dynamic cursor
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const container = stage.container();

    const getCursor = () => {
      if (isDraggable) return 'grabbing';
      switch (activeTool) {
        case 'pan': return 'grab';
        case 'bbox':
        case 'polygon':
        case 'pen':
        case 'points':
          return 'crosshair';
        case 'eraser':
          return 'url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImJsYWNrIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PHBhdGggZD0iTTIwIDExTDE0IDVMNCAxNWw3IDcgOS05eiIvPjxwYXRoIGQ9Ik0xOCA5bC0yIDIiLz48L3N2Zz4=") 0 24, auto'; // Eraser icon
        case 'select':
          return 'default';
        default:
          return 'default';
      }
    };

    container.style.cursor = getCursor();
  }, [activeTool, isDraggable]);

  const handleStageClick = (e: any) => {
    // If we clicked on the stage background (not a shape)
    if (e.target === e.target.getStage() && activeTool === 'select') {
      setSelectedObjectId(null);
    }
  };

  return (
    <Stage
      ref={stageRef}
      width={width}
      height={height}
      scaleX={scale}
      scaleY={scale}
      x={stagePos.x}
      y={stagePos.y}
      draggable={isDraggable}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onDragEnd={handleDragEnd}
      onClick={handleStageClick}
      onTap={handleStageClick}
      imageSmoothingEnabled={false}
    >
      <BackgroundLayer imageUrl={imageUrl} />
      <AnnotationLayer />
      <InteractionLayer imageUrl={imageUrl} />
    </Stage>
  );
};
