import React, { useEffect, useRef } from 'react';
import { Line } from 'react-konva';
import type Konva from 'konva';

interface MarchingAntsProps {
  points: number[];
  stroke?: string;
  strokeWidth?: number;
  dashSpeed?: number; // ms per frame
  opacity?: number;
}

/**
 * Marching Ants animasyonu: kesikli çizgi hareket ediyormuş gibi görünür.
 * requestAnimationFrame ile offset'i kaydırarak animasyon yapar.
 * Performans için React state yerine doğrudan Konva node'u manipüle eder.
 */
export const MarchingAnts: React.FC<MarchingAntsProps> = ({
  points,
  stroke = '#22c55e',
  strokeWidth = 2,
  dashSpeed = 120,
  opacity = 0.9,
}) => {
  const lineRef = useRef<Konva.Line>(null);
  const offsetRef = useRef(0);
  const animFrameRef = useRef<number>(0);
  const lastTimeRef = useRef(0);

  useEffect(() => {
    const animate = (time: number) => {
      if (time - lastTimeRef.current >= dashSpeed) {
        lastTimeRef.current = time;
        offsetRef.current = (offsetRef.current + 1) % 12;
        if (lineRef.current) {
          lineRef.current.dashOffset(-offsetRef.current);
          lineRef.current.getLayer()?.batchDraw();
        }
      }
      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [dashSpeed]);

  if (points.length < 2) return null;

  return (
    <Line
      ref={lineRef}
      points={points}
      stroke={stroke}
      strokeWidth={strokeWidth}
      dash={[6, 6]}
      dashOffset={0}
      lineJoin="round"
      lineCap="round"
      opacity={opacity}
      listening={false}
    />
  );
};

/**
 * Marching ants animasyonu için hazır dash pattern sabitleri
 */
export const MARCHING_ANTS_DASH = [6, 6];
export const MARCHING_ANTS_DASH_SPEED_MS = 120;
