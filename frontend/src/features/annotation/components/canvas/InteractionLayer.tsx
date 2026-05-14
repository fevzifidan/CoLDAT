import React, { useRef } from 'react';
import { Layer, Rect, Line, Circle } from 'react-konva';
import Konva from 'konva';
import { useAppStore } from '../../../../store/hooks/useAppStore';
import { useShallow } from 'zustand/react/shallow';
import { useDrawBox } from '../../tools/bounding-box/useDrawBox';
import { useDrawPolygon } from '../../tools/polygon/useDrawPolygon';
import { useDrawPen } from '../../tools/pen/useDrawPen';
import { useEraser } from '../../tools/eraser/useEraser';
import { useZoom } from '../../../viewer/hooks/useZoom';
import { MagnifierLens } from './MagnifierLens';
import { useLivewire } from '../../tools/livewire/useLivewire';
import { LivewirePreview } from '../../tools/livewire/LivewirePreview';
import { useSamInteraction } from '../../tools/sam/useSamInteraction';


interface InteractionLayerProps {
  imageUrl: string;
}

export const InteractionLayer: React.FC<InteractionLayerProps> = ({ imageUrl }) => {
  const { activeTool, imgDimensions, isReadOnly, scale } = useAppStore(
    useShallow((state) => ({
      activeTool: state.activeTool,
      imgDimensions: state.imgDimensions,
      isReadOnly: state.isReadOnly,
      scale: state.scale,
    }))
  );
  
  const draftBoxRef = useRef<Konva.Rect>(null);
  const draftPolyRef = useRef<Konva.Line>(null);
  const draftPenRef = useRef<Konva.Line>(null);
  const livewireMainRef = useRef<Konva.Line>(null);
  const livewireMagnifierRef = useRef<Konva.Line>(null);

  
  const { handleWheel } = useZoom();
  const { 
    handleMouseDown: boxDown, 
    handleMouseMove: boxMove, 
    handleMouseUp: boxUp 
  } = useDrawBox(draftBoxRef);

  const {
    handleMouseDown: polyDown,
    handleMouseMove: polyMove,
    handleMouseUp: polyUp,
    cancelDrawing: cancelPoly,
    undoLastPoint: undoPoly,
    points: polyPoints
  } = useDrawPolygon(draftPolyRef);

  const {
    handleMouseDown: penDown,
    handleMouseMove: penMove,
    handleMouseUp: penUp,
    cancelDrawing: cancelPen,
    points: penPoints
  } = useDrawPen(draftPenRef);

  const {
    handleMouseDown: eraserDown,
    handleMouseMove: eraserMove,
    handleMouseUp: eraserUp,
  } = useEraser();
  
  const {
    handleMouseDown: livewireDown,
    handleMouseMove: livewireMove,
    finalizeDrawing: livewireFinalize,
    undoLastPoint: livewireUndo,
    resetDrawing: livewireReset,
    committedPoints: livewirePoints,
    lastSnappedPoint: livewireSnap,
    isDrawing: isLivewireDrawing
  } = useLivewire([livewireMainRef, livewireMagnifierRef]);

  // SAM interaction — handles left-click (positive) and right-click (negative) prompts
  const {
    handleMouseDown: samDown,
    handleMouseUp: samUp,
  } = useSamInteraction({ disabled: isReadOnly });

  // Get SAM store actions for keyboard shortcuts
  const clearSamPrompts = useAppStore(state => state.clearSamPrompts);
  const removeSamPrompt = useAppStore(state => state.removeSamPrompt);
  const samPromptCount = useAppStore(state => state.samPromptCount);

  // Keyboard shortcut for cancelling and SAM prompt management
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isReadOnly) return;
      if (e.key === 'Escape') {
        if (activeTool === 'polygon') cancelPoly();
        if (activeTool === 'pen') cancelPen();
        if (activeTool === 'livewire') livewireReset();
        if (activeTool === 'sam') {
          e.preventDefault();
          clearSamPrompts();
        }
      }
      
      if (e.key === 'Backspace' || (e.key === 'z' && (e.ctrlKey || e.metaKey))) {
        if (activeTool === 'polygon') {
          e.preventDefault();
          undoPoly();
        }
        if (activeTool === 'livewire') {
          e.preventDefault();
          livewireUndo();
        }
        if (activeTool === 'sam') {
          e.preventDefault();
          removeSamPrompt(samPromptCount - 1);
        }
      }

      if (e.key === 'Enter') {
        if (activeTool === 'livewire') livewireFinalize();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTool, cancelPoly, cancelPen, undoPoly, livewireFinalize, livewireUndo, livewireReset, isReadOnly, clearSamPrompts, removeSamPrompt, samPromptCount]);

  const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (e.evt.ctrlKey) return; // Ctrl + LMB is for panning
    if (activeTool === 'bbox') boxDown(e);
    else if (activeTool === 'polygon') polyDown(e);
    else if (activeTool === 'pen') penDown(e);
    else if (activeTool === 'eraser') eraserDown(e);
    else if (activeTool === 'livewire') livewireDown(e);
    else if (activeTool === 'sam') samDown(e);
  };
  const handleMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (activeTool === 'bbox') boxMove(e);
    else if (activeTool === 'polygon') polyMove(e);
    else if (activeTool === 'pen') penMove(e);
    else if (activeTool === 'eraser') eraserMove(e);
    else if (activeTool === 'livewire') livewireMove(e);
  };


  const handleMouseUp = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (activeTool === 'bbox') boxUp(e);
    else if (activeTool === 'polygon') polyUp(e);
    else if (activeTool === 'pen') penUp(e);
    else if (activeTool === 'eraser') eraserUp();
    else if (activeTool === 'sam') samUp(e);
  };

  if (!imgDimensions) return null;

  return (
    <Layer>
      {/* Event capturing area spanning the whole image */}
      <Rect
        x={0}
        y={0}
        width={imgDimensions.width}
        height={imgDimensions.height}
        fill="transparent"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        listening={!isReadOnly && ['bbox', 'polygon', 'pen', 'livewire', 'sam'].includes(activeTool)}
      />

      
      {/* Draft Box */}
      <Rect
        ref={draftBoxRef}
        visible={false}
        stroke="#22c55e"
        strokeWidth={2 / scale}
        listening={false}
      />
      
      {/* Draft Polygon */}
      <Line
        ref={draftPolyRef}
        stroke="#22c55e"
        strokeWidth={2 / scale}
        listening={false}
      />

      {/* Draft Pen */}
      <Line
        ref={draftPenRef}
        stroke="#22c55e"
        strokeWidth={2 / scale}
        listening={false}
        visible={false}
      />
      
      {/* Livewire Preview */}
      {activeTool === 'livewire' && (
        <LivewirePreview 
          committedPoints={livewirePoints} 
          previewLineRef={livewireMainRef} 
          lastSnappedPoint={livewireSnap}
        />
      )}

      {polyPoints.map((_, i) => {
        if (i % 2 !== 0) return null;
        return (
          <Circle
            key={i}
            x={polyPoints[i]}
            y={polyPoints[i+1]}
            radius={4 / scale}
            fill="#22c55e"
            listening={false}
          />
        );
      })}
      
      <MagnifierLens imageUrl={imageUrl}>
        {/* Draft Box */}
        <Rect
          visible={draftBoxRef.current?.visible()}
          x={draftBoxRef.current?.x()}
          y={draftBoxRef.current?.y()}
          width={draftBoxRef.current?.width()}
          height={draftBoxRef.current?.height()}
          stroke="#22c55e"
          strokeWidth={2 / scale}
          listening={false}
        />
        
        {/* Draft Polygon */}
        <Line
          points={polyPoints}
          stroke="#22c55e"
          strokeWidth={2 / scale}
          listening={false}
        />

        {/* Draft Pen */}
        <Line
          points={penPoints}
          stroke="#22c55e"
          strokeWidth={2 / scale}
          listening={false}
        />

        {polyPoints.map((_, i) => {
          if (i % 2 !== 0) return null;
          return (
            <Circle
              key={i}
              x={polyPoints[i]}
              y={polyPoints[i+1]}
              radius={4 / scale}
              fill="#22c55e"
              listening={false}
            />
          );
        })}

        {activeTool === 'livewire' && (
          <LivewirePreview 
            committedPoints={livewirePoints} 
            previewLineRef={livewireMagnifierRef} 
            lastSnappedPoint={livewireSnap}
          />
        )}
      </MagnifierLens>
    </Layer>
  );
};
