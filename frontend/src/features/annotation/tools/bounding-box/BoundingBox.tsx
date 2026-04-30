import React, { useRef } from 'react';
import { Rect, Group, Text } from 'react-konva';
import { useAppStore } from '../../../../store/hooks/useAppStore';
import type { AnnotatedObject } from '../../types/annotation.types';
import { clampBox } from '../../../viewer/utils/coordinateUtils';
import Konva from 'konva';
import { Html } from 'react-konva-utils';
import { ObjectMenu } from '../../components/RightPanel/InspectorTab/ObjectMenu';

interface BoundingBoxProps {
  data: AnnotatedObject;
}

const hexToRGBA = (hex: string, alpha: number) => {
  let r = 0, g = 0, b = 0;
  if (hex.startsWith('#')) {
    if (hex.length === 4) {
      r = parseInt(hex[1] + hex[1], 16);
      g = parseInt(hex[2] + hex[2], 16);
      b = parseInt(hex[3] + hex[3], 16);
    } else if (hex.length === 7) {
      r = parseInt(hex.slice(1, 3), 16);
      g = parseInt(hex.slice(3, 5), 16);
      b = parseInt(hex.slice(5, 7), 16);
    }
  }
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const BoundingBox: React.FC<BoundingBoxProps> = ({ data }) => {
  if (data.coordinates.length < 4) return null;
  const [x, y, w, h] = data.coordinates;
  const startCoords = useRef<number[] | null>(null);

  const { 
    selectedObjectId, 
    setSelectedObjectId, 
    activeTool, 
    updateObject, 
    deleteObject,
    opacity,
    imgDimensions,
    isReadOnly
  } = useAppStore();

  const isSelected = selectedObjectId === data.id;
  const isSelectMode = activeTool === 'select';
  const isEraserMode = activeTool === 'eraser';

  const handlePointerDown = () => {
    if (isReadOnly) {
      setSelectedObjectId(data.id);
      return;
    }
    if (isSelectMode) setSelectedObjectId(data.id);
    if (isEraserMode) deleteObject(data.id);
  };

  const color = data.color || '#3b82f6';

  return (
    <Group 
      onClick={handlePointerDown}
      onTap={handlePointerDown}
      onMouseEnter={(e) => {
        if (!isReadOnly && isEraserMode && e.evt.buttons === 1) deleteObject(data.id);
      }}
      draggable={!isReadOnly && !data.locked && isSelected && isSelectMode}
      onDragStart={() => {
        startCoords.current = [...data.coordinates];
      }}
      onDragEnd={(e) => {
        if (e.target !== e.currentTarget || !startCoords.current) return;
        
        const xOffset = e.target.x();
        const yOffset = e.target.y();
        const [oldX, oldY, oldW, oldH] = startCoords.current;
        
        let newX = oldX + xOffset;
        let newY = oldY + yOffset;
        let newW = oldW;
        let newH = oldH;
        
        if (imgDimensions) {
          [newX, newY, newW, newH] = clampBox(newX, newY, newW, newH, imgDimensions.width, imgDimensions.height);
        }
        
        e.target.position({ x: 0, y: 0 }); // Reset visual position after store update
        updateObject(data.id, { coordinates: [newX, newY, newW, newH] });
        startCoords.current = null;
      }}
    >
      {/* Background for text */}
      <Rect 
        x={x} 
        y={y - 20} 
        width={100} 
        height={20} 
        fill={color} 
        visible={isSelected}
      />
      <Text
        x={x + 4}
        y={y - 16}
        text={data.label}
        fill="white"
        fontSize={12}
        fontFamily="sans-serif"
        visible={isSelected}
      />
      {isSelected && !isReadOnly && (
        <Html divProps={{ style: { pointerEvents: 'auto' } }}>
          <div style={{ position: 'absolute', top: `${y - 24}px`, left: `${x + 102}px` }}>
            <ObjectMenu object={data} />
          </div>
        </Html>
      )}
      <Rect
        x={x}
        y={y}
        width={w}
        height={h}
        stroke={color}
        strokeWidth={isSelected ? 3 : 2}
        fill={hexToRGBA(color, opacity / 100)}
        hitStrokeWidth={10}
      />
    </Group>
  );
};
