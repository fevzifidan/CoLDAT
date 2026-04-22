import { useCallback } from 'react';
import { useAppStore } from '../../../store/hooks/useAppStore';
import { calculateNewStagePos, getScaleMultiplier } from '../utils/zoomMath';
import Konva from 'konva';

export const useZoom = () => {
  const { scale, stagePos, setScale, setStagePos } = useAppStore();

  const handleWheel = useCallback((e: Konva.KonvaEventObject<WheelEvent> | WheelEvent, stageOverride?: Konva.Stage) => {
    const nativeEvent = 'evt' in e ? e.evt : e;
    
    // Only zoom with CTRL key
    if (!nativeEvent.ctrlKey) return;

    // Prevent default browser zoom
    nativeEvent.preventDefault();

    if ('cancelBubble' in e) {
      e.cancelBubble = true; // Konva stop propagation
    }

    const stage = stageOverride || (e as Konva.KonvaEventObject<WheelEvent>).target?.getStage?.();
    if (!stage) return;

    const pointerPos = stage.getPointerPosition();
    if (!pointerPos) return;

    const scaleMultiplier = getScaleMultiplier(nativeEvent.deltaY);
    const newScale = scale * scaleMultiplier;
    
    // Limits
    if (newScale < 0.1 || newScale > 50) return;

    const newPos = calculateNewStagePos(pointerPos, stagePos, scale, newScale);

    setScale(newScale);
    setStagePos(newPos);
  }, [scale, stagePos, setScale, setStagePos]);

  return { handleWheel };
};
