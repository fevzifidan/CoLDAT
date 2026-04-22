import React from 'react';
import { Layer } from 'react-konva';
import { BackgroundImage } from './BackgroundImage';

interface BackgroundLayerProps {
  imageUrl: string;
}

export const BackgroundLayer: React.FC<BackgroundLayerProps> = ({ imageUrl }) => {
  return (
    <Layer>
      <BackgroundImage url={imageUrl} />
      {/* Grid lines could be added here in the future */}
    </Layer>
  );
};
