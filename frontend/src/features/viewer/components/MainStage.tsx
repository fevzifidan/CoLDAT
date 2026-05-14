import React, { useRef, useEffect } from 'react';
import { Stage } from 'react-konva';
import Konva from 'konva';
import { useAppStore } from '../../../store/hooks/useAppStore';
import { useZoom } from '../hooks/useZoom';
import { usePan } from '../hooks/usePan';
import { BackgroundLayer } from './BackgroundLayer';
import { AnnotationLayer } from '../../annotation/components/canvas/AnnotationLayer';
import { InteractionLayer } from '../../annotation/components/canvas/InteractionLayer';

import { SamCanvas } from '../../annotation/tools/sam/SamCanvas';

interface MainStageProps {
  width: number;
  height: number;
  imageUrl: string;
}

export const MainStage: React.FC<MainStageProps> = ({ width, height, imageUrl }) => {
  const stageRef = useRef<Konva.Stage>(null);
  
  // We don't subscribe to scale and stagePos here to prevent re-renders on transient updates.
  const setSelectedObjectId = useAppStore(state => state.setSelectedObjectId);
  const activeTool = useAppStore(state => state.activeTool);

  const { handleWheel } = useZoom();
  const { isDraggable, handleMouseDown, handleMouseUp, handleDragEnd } = usePan();

  // Make Konva stage container transparent so DotGridBackground shows through
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const container = stage.container();
    container.style.background = 'transparent';

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
        case 'sam':
          return 'crosshair'; // SAM prompts are placed with crosshair precision
        case 'select':
          return 'default';
        default:
          return 'default';
      }
    };

    container.style.cursor = getCursor();
  }, [activeTool, isDraggable]);

  // Sync stage to Zustand store when it's updated from elsewhere (e.g. Toolbar zoom buttons)
  useEffect(() => {
    return useAppStore.subscribe((state, prevState) => {
      const stage = stageRef.current;
      if (!stage) return;

      // Only sync if scale or position actually changed in the store
      const scaleChanged = state.scale !== prevState.scale;
      const posChanged = state.stagePos !== prevState.stagePos;
      
      if (!scaleChanged && !posChanged) return;

      // Do not override local position if the user is actively dragging the canvas
      if (stage.isDragging()) return;

      const currentScale = stage.scaleX();
      const currentPos = stage.position();
      let needsUpdate = false;

      if (scaleChanged && currentScale !== state.scale) {
        stage.scale({ x: state.scale, y: state.scale });
        needsUpdate = true;
      }

      if (posChanged && (currentPos.x !== state.stagePos.x || currentPos.y !== state.stagePos.y)) {
        stage.position(state.stagePos);
        needsUpdate = true;
      }

      if (needsUpdate) {
        stage.batchDraw();
      }
    });
  }, []);

  const handleStageClick = (e: any) => {
    // If we clicked on the stage background (not a shape)
    if (e.target === e.target.getStage() && activeTool === 'select') {
      setSelectedObjectId(null);
    }
  };

  // Prevent the browser's default right-click context menu when SAM tool is active
  const handleContextMenu = (e: any) => {
    if (activeTool === 'sam') {
      e.evt.preventDefault();
    }
  };

  return (
    <Stage
      ref={stageRef}
      width={width}
      height={height}
      scaleX={useAppStore.getState().scale}
      scaleY={useAppStore.getState().scale}
      x={useAppStore.getState().stagePos.x}
      y={useAppStore.getState().stagePos.y}
      draggable={isDraggable}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onDragEnd={handleDragEnd}
      onClick={handleStageClick}
      onTap={handleStageClick}
      onContextMenu={handleContextMenu}
      imageSmoothingEnabled={false}
    >
      <BackgroundLayer imageUrl={imageUrl} />
      <AnnotationLayer />
      <SamCanvas />
      <InteractionLayer imageUrl={imageUrl} />
    </Stage>
  );
};
