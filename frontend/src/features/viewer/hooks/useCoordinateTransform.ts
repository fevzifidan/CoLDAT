import { useCallback } from 'react';
import { useAppStore } from '../../../store/hooks/useAppStore';
import type { Point } from '../types/viewer.types';
import Konva from 'konva';

export const useCoordinateTransform = () => {
  const screenToImage = useCallback((screenPos: Point): Point => {
    const { scale, stagePos } = useAppStore.getState();
    return {
      x: (screenPos.x - stagePos.x) / scale,
      y: (screenPos.y - stagePos.y) / scale,
    };
  }, []);

  const imageToScreen = useCallback((imagePos: Point): Point => {
    const { scale, stagePos } = useAppStore.getState();
    return {
      x: imagePos.x * scale + stagePos.x,
      y: imagePos.y * scale + stagePos.y,
    };
  }, []);

  const getRelativePointerPosition = useCallback((stage: Konva.Stage): Point | null => {
    const pointerPos = stage.getPointerPosition();
    if (!pointerPos) return null;
    
    const transform = stage.getAbsoluteTransform().copy();
    transform.invert();
    return transform.point(pointerPos);
  }, []);

  return { screenToImage, imageToScreen, getRelativePointerPosition };
};
