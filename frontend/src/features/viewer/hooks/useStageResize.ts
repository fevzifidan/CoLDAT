import { useEffect, useState } from 'react';
import type { RefObject } from 'react';
import { useAppStore } from '../../../store/hooks/useAppStore';
import { calculateFitAndCenter } from '../utils/centering';

export const useStageResize = (containerRef: RefObject<HTMLDivElement | null>) => {
  const [size, setSize] = useState({ width: 0, height: 0 });
  const { imgDimensions, setScale, setStagePos, isLoaded, setContainerSize } = useAppStore();
  const [hasInitialFit, setHasInitialFit] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        setSize({ width, height });
        setContainerSize({ width, height });
      }
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, [containerRef, setContainerSize]);

  // Handle initial fit when image is loaded and size is available
  useEffect(() => {
    if (isLoaded && imgDimensions && size.width > 0 && size.height > 0 && !hasInitialFit) {
      const { scale, pos } = calculateFitAndCenter(size.width, size.height, imgDimensions.width, imgDimensions.height);
      setScale(scale);
      setStagePos(pos);
      setHasInitialFit(true);
    }
  }, [isLoaded, imgDimensions, size, hasInitialFit, setScale, setStagePos]);

  return size;
};
