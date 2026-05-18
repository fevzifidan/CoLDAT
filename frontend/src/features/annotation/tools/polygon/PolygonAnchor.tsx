import { Circle } from 'react-konva';
import { useAppStore } from '../../../../store/hooks/useAppStore';

interface PolygonAnchorProps {
  x: number;
  y: number;
  index: number;
  color: string;
  onDrag: (index: number, x: number, y: number) => void;
  onDragEnd: (index: number, x: number, y: number) => void;
}

export const PolygonAnchor: React.FC<PolygonAnchorProps> = ({ x, y, index, color, onDrag, onDragEnd }) => {
  const scale = useAppStore(state => state.scale);

  return (
    <Circle
      x={x}
      y={y}
      radius={4 / scale}
      fill="white"
      stroke={color}
      strokeWidth={2 / scale}
      draggable
      onDragMove={(e) => {
        onDrag(index, e.target.x(), e.target.y());
      }}
      onDragEnd={(e) => {
        onDragEnd(index, e.target.x(), e.target.y());
      }}
      hitStrokeWidth={12 / scale}
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
