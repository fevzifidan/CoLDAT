import { useCallback } from 'react';
import { useAppStore } from '../../../store/hooks/useAppStore';
import type { Point } from '../types/viewer.types';
import Konva from 'konva';

export const useCoordinateTransform = () => {
  const scale = useAppStore(state => state.scale);
  const stagePos = useAppStore(state => state.stagePos);

  const screenToImage = useCallback((screenPos: Point): Point => {
    return {
      x: (screenPos.x - stagePos.x) / scale,
      y: (screenPos.y - stagePos.y) / scale,
    };
  }, [scale, stagePos]);

  const imageToScreen = useCallback((imagePos: Point): Point => {
    return {
      x: imagePos.x * scale + stagePos.x,
      y: imagePos.y * scale + stagePos.y,
    };
  }, [scale, stagePos]);

  const getRelativePointerPosition = useCallback((stage: Konva.Stage): Point | null => {
    const pointerPos = stage.getPointerPosition();
    if (!pointerPos) return null;
    
    const transform = stage.getAbsoluteTransform().copy();
    transform.invert();
    return transform.point(pointerPos);
  }, []);

  return { screenToImage, imageToScreen, getRelativePointerPosition };
};
