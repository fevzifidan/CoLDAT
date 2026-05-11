import React, { useRef } from 'react';
import { useStageResize } from '../hooks/useStageResize';
import { MainStage } from './MainStage';

interface CanvasContainerProps {
  imageUrl: string;
}

export const CanvasContainer: React.FC<CanvasContainerProps> = ({ imageUrl }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const size = useStageResize(containerRef);

  return (
    <div ref={containerRef} className="w-full h-full overflow-hidden relative">
      {size.width > 0 && size.height > 0 && (
        <MainStage width={size.width} height={size.height} imageUrl={imageUrl} />
      )}
    </div>
  );
};
