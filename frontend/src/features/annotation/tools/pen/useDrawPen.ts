import { useRef, useCallback, useState } from 'react';
import { useAppStore } from '../../../../store/hooks/useAppStore';
import { useCoordinateTransform } from '../../../viewer/hooks/useCoordinateTransform';
import { clampPoint } from '../../../viewer/utils/coordinateUtils';
import Konva from 'konva';

export const useDrawPen = (
  draftLineRef: React.RefObject<Konva.Line | null>
) => {
  const isDrawing = useRef(false);
  const [points, setPoints] = useState<number[]>([]);
  const { getRelativePointerPosition } = useCoordinateTransform();
  
  const handleMouseDown = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    if (e.evt.button !== 0) return;
    const stage = e.target.getStage();
    const imgDims = useAppStore.getState().imgDimensions;
    if (!stage || !imgDims) return;
    
    let pos = getRelativePointerPosition(stage);
    if (!pos) return;
    
    pos = clampPoint(pos, imgDims.width, imgDims.height);
    
    isDrawing.current = true;
    const newPoints = [pos.x, pos.y];
    setPoints(newPoints);
    
    if (draftLineRef.current) {
      draftLineRef.current.points(newPoints);
      draftLineRef.current.visible(true);
    }
  }, [getRelativePointerPosition, draftLineRef]);

  const handleMouseMove = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!isDrawing.current) return;
    const stage = e.target.getStage();
    const imgDims = useAppStore.getState().imgDimensions;
    if (!stage || !imgDims) return;
    
    let pos = getRelativePointerPosition(stage);
    if (!pos) return;
    
    pos = clampPoint(pos, imgDims.width, imgDims.height);
    
    const newPoints = [...points, pos.x, pos.y];
    setPoints(newPoints);
    
    if (draftLineRef.current) {
      draftLineRef.current.points(newPoints);
    }
  }, [points, getRelativePointerPosition, draftLineRef]);

  const handleMouseUp = useCallback((_e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!isDrawing.current) return;
    isDrawing.current = false;
    
    if (points.length < 4) {
      setPoints([]);
      if (draftLineRef.current) draftLineRef.current.visible(false);
      return;
    }

    const { annotatedObjects, setAnnotatedObjects } = useAppStore.getState();
    setAnnotatedObjects([
      ...annotatedObjects,
      {
        id: `pen-${Date.now()}`,
        classId: 'temp',
        label: 'New Path',
        type: 'polygon', // We treat freehand as a polygon for now
        color: '#22c55e',
        coordinates: [...points],
        zIndex: annotatedObjects.length,
        visible: true,
        locked: false
      }
    ]);
    
    setPoints([]);
    if (draftLineRef.current) {
      draftLineRef.current.points([]);
      draftLineRef.current.visible(false);
    }
  }, [points, draftLineRef]);

  const cancelDrawing = useCallback(() => {
    isDrawing.current = false;
    setPoints([]);
    if (draftLineRef.current) {
      draftLineRef.current.points([]);
      draftLineRef.current.visible(false);
    }
  }, [draftLineRef]);

  return { handleMouseDown, handleMouseMove, handleMouseUp, cancelDrawing, points };
};
