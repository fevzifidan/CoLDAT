import { useCallback } from 'react';
import { useAppStore } from '../../../store/hooks/useAppStore';
import { calculateNewStagePos, getScaleMultiplier } from '../utils/zoomMath';
import Konva from 'konva';

export const useZoom = () => {
  // We only get the setters to avoid re-rendering on every scroll tick.
  const setScale = useAppStore(state => state.setScale);
  const setStagePos = useAppStore(state => state.setStagePos);

  const handleWheel = useCallback((e: Konva.KonvaEventObject<WheelEvent> | WheelEvent, stageOverride?: Konva.Stage) => {
    const nativeEvent = 'evt' in e ? e.evt : e;
    
    if (!nativeEvent.ctrlKey) return;
    nativeEvent.preventDefault();
    if ('cancelBubble' in e) {
      e.cancelBubble = true;
    }

    const stage = stageOverride || (e as Konva.KonvaEventObject<WheelEvent>).target?.getStage?.();
    if (!stage) return;

    const pointerPos = stage.getPointerPosition();
    if (!pointerPos) return;

    // Transient read from store to get the exact values without triggering a render
    const currentScale = useAppStore.getState().scale;
    const currentStagePos = useAppStore.getState().stagePos;

    const scaleMultiplier = getScaleMultiplier(nativeEvent.deltaY);
    const newScale = currentScale * scaleMultiplier;
    
    // Limits
    if (newScale < 0.1 || newScale > 50) return;

    const newPos = calculateNewStagePos(pointerPos, currentStagePos, currentScale, newScale);

    // 1. Transient update directly to Konva Stage for pixel-perfect precision instantly
    stage.scale({ x: newScale, y: newScale });
    stage.position(newPos);
    stage.batchDraw();

    // 2. Update Zustand store seamlessly in the background
    setScale(newScale);
    setStagePos(newPos);
  }, [setScale, setStagePos]);

  return { handleWheel };
};
