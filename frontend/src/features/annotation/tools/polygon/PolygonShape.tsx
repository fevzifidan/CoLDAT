import React, { useCallback, useRef, memo, useMemo } from 'react';
import { Group, Line, Text } from 'react-konva';
import type { AnnotatedObject } from '../../types/annotation.types';
import { PolygonAnchor } from '@/features/annotation/tools/polygon/PolygonAnchor';
import { useAppStore } from '../../../../store/hooks/useAppStore';
import { clampPoint } from '../../../viewer/utils/coordinateUtils';
import { Html } from 'react-konva-utils';
import { ObjectMenu } from '../../components/RightPanel/InspectorTab/ObjectMenu';

interface PolygonShapeProps {
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

export const PolygonShape: React.FC<PolygonShapeProps> = memo(({ data }) => {
  const selectedObjectId = useAppStore(state => state.selectedObjectId);
  const setSelectedObjectId = useAppStore(state => state.setSelectedObjectId);
  const activeTool = useAppStore(state => state.activeTool);
  const updateObject = useAppStore(state => state.updateObject);
  const deleteObject = useAppStore(state => state.deleteObject);
  const opacity = useAppStore(state => state.opacity);
  const imgDimensions = useAppStore(state => state.imgDimensions);
  const isReadOnly = useAppStore(state => state.isReadOnly);
  
  const startCoords = useRef<number[] | null>(null);

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

  const handlePointDrag = useCallback((index: number, x: number, y: number) => {
    if (!imgDimensions) return;
    const clamped = clampPoint({ x, y }, imgDimensions.width, imgDimensions.height);
    const newCoords = [...data.coordinates];
    newCoords[index * 2] = clamped.x;
    newCoords[index * 2 + 1] = clamped.y;
    updateObject(data.id, { coordinates: newCoords }, true); // skip history during drag
  }, [data.coordinates, data.id, updateObject, imgDimensions]);

  const handlePointDragEnd = useCallback((index: number, x: number, y: number) => {
    if (!imgDimensions) return;
    const clamped = clampPoint({ x, y }, imgDimensions.width, imgDimensions.height);
    const newCoords = [...data.coordinates];
    newCoords[index * 2] = clamped.x;
    newCoords[index * 2 + 1] = clamped.y;
    updateObject(data.id, { coordinates: newCoords }, false); // save history on drag end
  }, [data.coordinates, data.id, updateObject, imgDimensions]);

  if (data.coordinates.length < 6) return null; // Needs at least 3 points

  const labelPos = useMemo(() => {
    if (!isSelected) return { x: 0, y: 0 };
    // Top-leftmost point for label
    let minX = data.coordinates[0];
    let minY = data.coordinates[1];
    for (let i = 0; i < data.coordinates.length; i += 2) {
      if (data.coordinates[i+1] < minY) {
        minY = data.coordinates[i+1];
        minX = data.coordinates[i];
      }
    }
    return { x: minX, y: minY };
  }, [data.coordinates, isSelected]);

  const color = data.color || '#3b82f6';
  const fillColor = useMemo(() => hexToRGBA(color, opacity / 100), [color, opacity]);

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
        
        // If the whole group is dragged
        const xOffset = e.target.x();
        const yOffset = e.target.y();
        
        const newCoords = startCoords.current.map((val, idx) => {
          const originalVal = val + (idx % 2 === 0 ? xOffset : yOffset);
          if (imgDimensions) {
            return idx % 2 === 0 
              ? Math.max(0, Math.min(imgDimensions.width, originalVal))
              : Math.max(0, Math.min(imgDimensions.height, originalVal));
          }
          return originalVal;
        });

        e.target.position({ x: 0, y: 0 }); // reset group pos after updating store
        updateObject(data.id, { coordinates: newCoords });
        startCoords.current = null;
      }}
    >
      <Line
        points={data.coordinates}
        stroke={color}
        strokeWidth={isSelected ? 3 : 2}
        strokeScaleEnabled={false}
        closed
        fill={fillColor}
        hitStrokeWidth={10}
      />
      
      {/* Label */}
      <Text
        x={labelPos.x}
        y={labelPos.y - 16}
        text={data.label}
        fill="white"
        fontSize={12}
        padding={2}
        visible={isSelected}
      />
      {isSelected && !isReadOnly && (
        <Html divProps={{ style: { pointerEvents: 'auto' } }}>
          <div style={{ position: 'absolute', top: `${labelPos.y - 20}px`, left: `${labelPos.x + 80}px` }}>
            <ObjectMenu object={data} />
          </div>
        </Html>
      )}

      {/* Anchors for editing */}
      {isSelected && !data.locked && !isReadOnly && (
        data.coordinates.map((_, i) => {
          if (i % 2 !== 0) return null;
          return (
            <PolygonAnchor
              key={i}
              x={data.coordinates[i]}
              y={data.coordinates[i+1]}
              index={i / 2}
              onDrag={handlePointDrag}
              onDragEnd={handlePointDragEnd}
              color={data.color || '#3b82f6'}
            />
          );
        })
      )}
    </Group>
  );
});
