import { useCallback, useRef } from 'react';
import { useAppStore } from '../../../store/hooks/useAppStore';
import { calculateNewStagePos, getScaleMultiplier } from '../utils/zoomMath';
import Konva from 'konva';

export const useZoom = () => {
  // We only get the setters to avoid re-rendering on every scroll tick.
  const setViewport = useAppStore(state => state.setViewport);
  const rafRef = useRef<number | null>(null);

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
    // This part is crucial for responsiveness and doesn't trigger React re-renders.
    stage.scale({ x: newScale, y: newScale });
    stage.position(newPos);
    stage.batchDraw();

    // 2. Throttled update to Zustand store
    // This syncs the rest of the application (UI, other layers) at a manageable rate.
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      setViewport(newScale, newPos);
    });
  }, [setViewport]);

  return { handleWheel };
};
