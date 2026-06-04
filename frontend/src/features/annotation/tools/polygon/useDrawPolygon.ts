import { useRef, useCallback, useState } from 'react';
import { useAppStore } from '../../../../store/hooks/useAppStore';
import { useCoordinateTransform } from '../../../viewer/hooks/useCoordinateTransform';
import { clampPoint } from '../../../viewer/utils/coordinateUtils';
import Konva from 'konva';

export const useDrawPolygon = (
  draftLineRef: React.RefObject<Konva.Line | null>
) => {
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

    // Check if clicking near the first point to close the polygon
    if (points.length >= 6) {
      const firstX = points[0];
      const firstY = points[1];
      const dist = Math.sqrt(Math.pow(pos.x - firstX, 2) + Math.pow(pos.y - firstY, 2));

      // Hit radius for closing
      if (dist < 10) {
        // Close and save
          const { annotatedObjects, setAnnotatedObjects, taxonomy } = useAppStore.getState();
          const firstClassId = taxonomy.classes.length > 0 ? taxonomy.classes[0].id : '';
          setAnnotatedObjects([
            ...annotatedObjects,
            {
              id: crypto.randomUUID(),
              classId: firstClassId,
              label: 'New Polygon',
              type: 'polygon',
              color: '#22c55e',
              coordinates: [...points],
              zIndex: annotatedObjects.length,
              visible: true,
              locked: false
            }
          ]);
        setPoints([]);
        if (draftLineRef.current) draftLineRef.current.points([]);
        return;
      }
    }

    // Add point
    const newPoints = [...points, pos.x, pos.y];
    setPoints(newPoints);
    if (draftLineRef.current) {
      draftLineRef.current.points(newPoints);
    }

  }, [points, getRelativePointerPosition, draftLineRef]);

  const handleMouseMove = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    if (points.length === 0) return;
    const stage = e.target.getStage();
    const imgDims = useAppStore.getState().imgDimensions;
    if (!stage || !imgDims) return;

    let pos = getRelativePointerPosition(stage);
    if (!pos) return;
    
    pos = clampPoint(pos, imgDims.width, imgDims.height);

    // Draw temporary line to cursor
    if (draftLineRef.current) {
      draftLineRef.current.points([...points, pos.x, pos.y]);
    }
  }, [points, getRelativePointerPosition, draftLineRef]);

  const handleMouseUp = useCallback(() => { }, []);
  
  const cancelDrawing = useCallback(() => {
    setPoints([]);
    if (draftLineRef.current) draftLineRef.current.points([]);
  }, [draftLineRef]);

  const undoLastPoint = useCallback(() => {
    if (points.length >= 2) {
      const newPoints = points.slice(0, -2);
      setPoints(newPoints);
      if (draftLineRef.current) draftLineRef.current.points(newPoints);
    }
  }, [points, draftLineRef]);

  return { handleMouseDown, handleMouseMove, handleMouseUp, cancelDrawing, undoLastPoint, points };
};
