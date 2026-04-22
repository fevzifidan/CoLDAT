import React from 'react';
import { useAppStore } from '../../../store/hooks/useAppStore';

export const ViewportControls: React.FC = () => {
  const scale = useAppStore(state => state.scale);
  const setScale = useAppStore(state => state.setScale);
  
  const zoomPercent = Math.round(scale * 100);

  return (
    <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-zinc-800/80 backdrop-blur text-xs px-3 py-1.5 rounded-md text-zinc-300">
      <span>{zoomPercent}%</span>
    </div>
  );
};
