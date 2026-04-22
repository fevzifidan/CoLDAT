import type { Point } from '../types/viewer.types';

export const getScaleMultiplier = (deltaY: number, zoomSpeed = 1.1) => {
  return deltaY < 0 ? zoomSpeed : 1 / zoomSpeed;
};

export const calculateNewStagePos = (
  pointerPos: Point,
  oldStagePos: Point,
  oldScale: number,
  newScale: number
): Point => {
  // pointer position relative to stage
  const mousePointTo = {
    x: (pointerPos.x - oldStagePos.x) / oldScale,
    y: (pointerPos.y - oldStagePos.y) / oldScale,
  };

  return {
    x: pointerPos.x - mousePointTo.x * newScale,
    y: pointerPos.y - mousePointTo.y * newScale,
  };
};
