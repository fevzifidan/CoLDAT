import type { Point } from '../types/viewer.types';

/**
 * Clamps a point within the given dimensions while preserving float precision.
 */
export const clampPoint = (point: Point, width: number, height: number): Point => {
  return {
    x: Math.max(0, Math.min(width, point.x)),
    y: Math.max(0, Math.min(height, point.y)),
  };
};

/**
 * Clamps a bounding box [x, y, w, h] within the given dimensions.
 * This ensures the box doesn't start outside or extend beyond the boundaries.
 */
export const clampBox = (
  x: number, 
  y: number, 
  w: number, 
  h: number, 
  imgWidth: number, 
  imgHeight: number
): [number, number, number, number] => {
  // Clamp start point
  let newX = Math.max(0, Math.min(imgWidth, x));
  let newY = Math.max(0, Math.min(imgHeight, y));
  
  // Clamp width/height so they don't exceed the image
  let newW = Math.min(w, imgWidth - newX);
  let newH = Math.min(h, imgHeight - newY);

  return [newX, newY, newW, newH];
};
