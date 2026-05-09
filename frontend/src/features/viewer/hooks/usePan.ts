import { useCallback, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useAppStore } from '../../../store/hooks/useAppStore';
import Konva from 'konva';

export const usePan = () => {
  const { setStagePos, activeTool, isCtrlDown } = useAppStore(
    useShallow((state) => ({
      setStagePos: state.setStagePos,
      activeTool: state.activeTool,
      isCtrlDown: state.isCtrlPressed,
    }))
  );
  const [isMiddleClickPan, setIsMiddleClickPan] = useState(false);

  const handleMouseDown = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    // Middle click or (Ctrl + Left Click)
    if (e.evt.button === 1 || (e.evt.button === 0 && e.evt.ctrlKey)) {
      e.evt.preventDefault();
      setIsMiddleClickPan(true);
    }
  }, []);

  const handleMouseUp = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    if (e.evt.button === 1 || e.evt.button === 0) {
      setIsMiddleClickPan(false);
    }
  }, []);

  const handleDragEnd = useCallback((e: Konva.KonvaEventObject<DragEvent>) => {
    // Stage was dragged
    if (e.target === e.target.getStage()) {
      setStagePos({
        x: e.target.x(),
        y: e.target.y()
      });
    }
  }, [setStagePos]);

  // Draggable if active tool is pan, OR middle click is held, OR Ctrl is held
  const isDraggable = activeTool === 'pan' || isMiddleClickPan || isCtrlDown;

  return { isDraggable, handleMouseDown, handleMouseUp, handleDragEnd };
};
