import React from 'react';
import { Layer, Group } from 'react-konva';
import { useAppStore } from '../../../../store/hooks/useAppStore';
import { BoundingBox } from '../../tools/bounding-box/BoundingBox';
import { PolygonShape } from '../../tools/polygon/PolygonShape';

export const AnnotationShapes: React.FC = () => {
  const annotatedObjects = useAppStore(state => state.annotatedObjects);

  return (
    <Group>
      {[...annotatedObjects]
        .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))
        .map(obj => {
          if (!obj.visible) return null;
          if (obj.type === 'bbox') {
            return <BoundingBox key={obj.id} data={obj} />;
          }
          if (obj.type === 'polygon') {
            return <PolygonShape key={obj.id} data={obj} />;
          }
          return null;
        })}
    </Group>
  );
};

export const AnnotationLayer: React.FC = () => {
  return (
    <Layer>
      <AnnotationShapes />
    </Layer>
  );
};
