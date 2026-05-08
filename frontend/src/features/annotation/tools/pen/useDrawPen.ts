import { useRef, useCallback } from 'react';
import { useAppStore } from '../../../../store/hooks/useAppStore';
import { useCoordinateTransform } from '../../../viewer/hooks/useCoordinateTransform';
import { clampPoint } from '../../../viewer/utils/coordinateUtils';
import Konva from 'konva';

export const useDrawPen = (
  draftLineRef: React.RefObject<Konva.Line | null>
) => {
  const isDrawing = useRef(false);
  const pointsRef = useRef<number[]>([]);
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
    pointsRef.current = newPoints;
    
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
    
    const newPoints = [...pointsRef.current, pos.x, pos.y];
    pointsRef.current = newPoints;
    
    if (draftLineRef.current) {
      draftLineRef.current.points(newPoints);
    }
  }, [getRelativePointerPosition, draftLineRef]);

  const handleMouseUp = useCallback((_e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!isDrawing.current) return;
    isDrawing.current = false;
    
    if (pointsRef.current.length < 4) {
      pointsRef.current = [];
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
        coordinates: [...pointsRef.current],
        zIndex: annotatedObjects.length,
        visible: true,
        locked: false
      }
    ]);
    
    pointsRef.current = [];
    if (draftLineRef.current) {
      draftLineRef.current.points([]);
      draftLineRef.current.visible(false);
    }
  }, [draftLineRef]);

  const cancelDrawing = useCallback(() => {
    isDrawing.current = false;
    pointsRef.current = [];
    if (draftLineRef.current) {
      draftLineRef.current.points([]);
      draftLineRef.current.visible(false);
    }
  }, [draftLineRef]);

  return { handleMouseDown, handleMouseMove, handleMouseUp, cancelDrawing, points: pointsRef.current };
};
