import React from 'react';
import { Line, Circle, Group } from 'react-konva';
import { useAppStore } from '../../../../store/hooks/useAppStore';
import Konva from 'konva';

interface LivewirePreviewProps {
  committedPoints: number[];
  previewLineRef: React.RefObject<Konva.Line>;
  lastSnappedPoint: { x: number; y: number } | null;
}

export const LivewirePreview: React.FC<LivewirePreviewProps> = ({ 
  committedPoints, 
  previewLineRef,
  lastSnappedPoint
}) => {
  const scale = useAppStore(state => state.scale);
  
  // Scale thickness and radius inversely with zoom to keep them visually consistent
  const strokeWidth = 2 / scale;
  const radius = 3 / scale;
  const snapRadius = 4 / scale;
  const dashSize = 5 / scale;

  return (
    <Group listening={false}>
      {/* Committed Path */}
      <Line
        points={committedPoints}
        stroke="#22c55e"
        strokeWidth={strokeWidth}
        lineJoin="round"
        lineCap="round"
      />
      
      {/* Live Preview Path (updated directly via Ref) */}
      <Line
        ref={previewLineRef}
        stroke="#22c55e"
        strokeWidth={strokeWidth}
        dash={[dashSize, dashSize]}
        lineJoin="round"
        lineCap="round"
      />

      {/* Anchor Points */}
      {Array.from({ length: committedPoints.length / 2 }).map((_, i) => (
        <Circle
          key={i}
          x={committedPoints[i * 2]}
          y={committedPoints[i * 2 + 1]}
          radius={radius}
          fill="#22c55e"
          stroke="white"
          strokeWidth={1 / scale}
        />
      ))}

      {/* Current Snap Indicator */}
      {lastSnappedPoint && (
        <Circle
          x={lastSnappedPoint.x}
          y={lastSnappedPoint.y}
          radius={snapRadius}
          fill="#fbbf24" // Amber for the snap indicator
          stroke="white"
          strokeWidth={2 / scale}
          shadowBlur={5 / scale}
          shadowColor="black"
          shadowOpacity={0.5}
        />
      )}
    </Group>
  );
};
