import { useRef, useCallback } from 'react';
import { useAppStore } from '../../../../store/hooks/useAppStore';
import { useCoordinateTransform } from '../../../viewer/hooks/useCoordinateTransform';
import { clampPoint, clampBox } from '../../../viewer/utils/coordinateUtils';
import Konva from 'konva';

export const useDrawBox = (draftNodeRef: React.RefObject<Konva.Rect | null>) => {
  const isDrawing = useRef(false);
  const startPoint = useRef({ x: 0, y: 0 });
  const { getRelativePointerPosition } = useCoordinateTransform();
  
  const handleMouseDown = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    if (e.evt.button !== 0) return; // Only left click
    const stage = e.target.getStage();
    const imgDims = useAppStore.getState().imgDimensions;
    if (!stage || !imgDims) return;
    
    let pos = getRelativePointerPosition(stage);
    if (!pos) return;
    
    pos = clampPoint(pos, imgDims.width, imgDims.height);
    
    isDrawing.current = true;
    startPoint.current = pos;
    
    if (draftNodeRef.current) {
      draftNodeRef.current.setAttrs({
        x: pos.x,
        y: pos.y,
        width: 0,
        height: 0,
        visible: true,
        stroke: '#22c55e', // Default creation color
      });
    }
  }, [getRelativePointerPosition, draftNodeRef]);

  const handleMouseMove = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!isDrawing.current) return;
    const stage = e.target.getStage();
    const imgDims = useAppStore.getState().imgDimensions;
    if (!stage || !imgDims) return;
    
    let pos = getRelativePointerPosition(stage);
    if (!pos) return;
    
    pos = clampPoint(pos, imgDims.width, imgDims.height);
    
    if (draftNodeRef.current) {
      draftNodeRef.current.setAttrs({
        width: pos.x - startPoint.current.x,
        height: pos.y - startPoint.current.y,
      });
    }
  }, [getRelativePointerPosition, draftNodeRef]);

  const handleMouseUp = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!isDrawing.current) return;
    isDrawing.current = false;
    
    if (draftNodeRef.current) {
      const attrs = draftNodeRef.current.attrs;
      const imgDims = useAppStore.getState().imgDimensions;
      draftNodeRef.current.visible(false);
      
      // Prevent clicking from making a tiny box
      if (Math.abs(attrs.width) < 5 || Math.abs(attrs.height) < 5) return;
      
      // Normalize width/height
      let x = attrs.x;
      let y = attrs.y;
      let w = attrs.width;
      let h = attrs.height;
      if (w < 0) { x += w; w = Math.abs(w); }
      if (h < 0) { y += h; h = Math.abs(h); }
      
      // Final clamping
      if (imgDims) {
        [x, y, w, h] = clampBox(x, y, w, h, imgDims.width, imgDims.height);
      }

      // Add to store
      const { annotatedObjects, setAnnotatedObjects } = useAppStore.getState();
      setAnnotatedObjects([
        ...annotatedObjects,
        {
          id: `bbox-${Date.now()}`,
          classId: 'temp',
          label: 'New Object',
          type: 'bbox',
          color: '#22c55e',
          coordinates: [x, y, w, h],
          zIndex: annotatedObjects.length,
          visible: true,
          locked: false
        }
      ]);
    }
  }, [draftNodeRef]);

  return { handleMouseDown, handleMouseMove, handleMouseUp };
};
