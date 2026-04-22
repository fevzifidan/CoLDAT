import React from 'react';
import { Circle } from 'react-konva';

interface PolygonAnchorProps {
  x: number;
  y: number;
  index: number;
  color: string;
  onDrag: (index: number, x: number, y: number) => void;
  onDragEnd: (index: number, x: number, y: number) => void;
}

export const PolygonAnchor: React.FC<PolygonAnchorProps> = ({ x, y, index, color, onDrag, onDragEnd }) => {
  return (
    <Circle
      x={x}
      y={y}
      radius={4}
      fill="white"
      stroke={color}
      strokeWidth={2}
      draggable
      onDragMove={(e) => {
        onDrag(index, e.target.x(), e.target.y());
      }}
      onDragEnd={(e) => {
        onDragEnd(index, e.target.x(), e.target.y());
      }}
      hitStrokeWidth={10}
      onMouseEnter={(e) => {
        const container = e.target.getStage()?.container();
        if (container) container.style.cursor = 'move';
      }}
      onMouseLeave={(e) => {
        const container = e.target.getStage()?.container();
        if (container) container.style.cursor = ''; // Reset to stage default
      }}
    />
  );
};
