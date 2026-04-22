import { useCallback, useState, useEffect } from 'react';
import { useAppStore } from '../../../store/hooks/useAppStore';
import Konva from 'konva';

export const usePan = () => {
  const { setStagePos, activeTool } = useAppStore();
  const [isMiddleClickPan, setIsMiddleClickPan] = useState(false);
  const [isCtrlDown, setIsCtrlDown] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Control') setIsCtrlDown(true);
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Control') setIsCtrlDown(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

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
