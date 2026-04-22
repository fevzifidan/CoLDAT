import type { Point } from '../types/viewer.types';

export const calculateFitAndCenter = (
  containerWidth: number,
  containerHeight: number,
  imageWidth: number,
  imageHeight: number,
  padding = 0.9 // 90% fit
): { scale: number; pos: Point } => {
  const scale = Math.min(
    (containerWidth * padding) / imageWidth,
    (containerHeight * padding) / imageHeight
  );

  const pos = {
    x: (containerWidth - imageWidth * scale) / 2,
    y: (containerHeight - imageHeight * scale) / 2,
  };

  return { scale, pos };
};
