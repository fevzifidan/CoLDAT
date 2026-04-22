import { useRef, useCallback } from 'react';
import { useAppStore } from '../../../../store/hooks/useAppStore';
import Konva from 'konva';

export const useEraser = () => {
  const isErasing = useRef(false);
  const deleteObject = useAppStore(state => state.deleteObject);
  
  const erase = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    // Find if we hit an annotation object
    // Note: Since this is called from InteractionLayer's background rect, 
    // it won't directly hit the shapes. 
    // We need to either use stage.getIntersection or handle it in the shapes themselves.
    
    // Better way: InteractionLayer background is transparent.
    // If we click on a shape while eraser is active, we should delete it.
    // But InteractionLayer sits on top of everything.
    
    const stage = e.target.getStage();
    if (!stage) return;
    
    const pos = stage.getPointerPosition();
    if (!pos) return;
    
    // Find all objects at this position
    const shape = stage.getIntersection(pos);
    if (shape) {
      // Find the parent group which has the object ID
      let parent = shape.getParent();
      while (parent && !parent.attrs.id?.startsWith('bbox-') && !parent.attrs.id?.startsWith('poly-') && !parent.attrs.id?.startsWith('pen-')) {
          // Check for custom attribute if we set it
          if (parent.attrs.name === 'annotation-group') break;
          parent = parent.getParent();
      }
      
      // If we found an annotation group
      // Actually, we can just check if the shape belongs to an annotation
      // For now, let's assume we can identify them by their names or IDs
    }
  }, [deleteObject]);

  const handleMouseDown = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    if (e.evt.button !== 0) return;
    isErasing.current = true;
    // eraser logic will be handled by shapes themselves mostly, 
    // or by checking intersection here.
  }, []);

  const handleMouseMove = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!isErasing.current) return;
    // continuous erasing logic
  }, []);

  const handleMouseUp = useCallback(() => {
    isErasing.current = false;
  }, []);

  return { handleMouseDown, handleMouseMove, handleMouseUp };
};
