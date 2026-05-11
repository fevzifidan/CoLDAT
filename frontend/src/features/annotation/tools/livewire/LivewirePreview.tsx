import React, { useEffect, useRef, useState } from 'react';
import { Line, Circle, Group } from 'react-konva';
import { useAppStore } from '../../../../store/hooks/useAppStore';
import Konva from 'konva';
import { MarchingAnts, MARCHING_ANTS_DASH, MARCHING_ANTS_DASH_SPEED_MS } from './MarchingAnts';

interface LivewirePreviewProps {
  committedPoints: number[];
  previewLineRef: React.RefObject<Konva.Line>;
  lastSnappedPoint: { x: number; y: number } | null;
}

// ─── Snap Pulse Animation ───────────────────────────────────────────────────

function useSnapPulse(snappedPoint: { x: number; y: number } | null) {
  const [pulseRadius, setPulseRadius] = useState(0);
  const [pulseOpacity, setPulseOpacity] = useState(0);
  const setSafePulseRadius = (r: number) => setPulseRadius(Math.max(r, 0));
  const prevSnapRef = useRef<string | null>(null);
  const animFrameRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    const snapKey = snappedPoint ? `${snappedPoint.x},${snappedPoint.y}` : null;
    
    // Snap noktası değiştiğinde pulse'ı tetikle
    if (snapKey && snapKey !== prevSnapRef.current) {
      prevSnapRef.current = snapKey;
      startTimeRef.current = performance.now();
      setSafePulseRadius(0);
      setPulseOpacity(0.7);

      const animate = (time: number) => {
        const elapsed = time - startTimeRef.current;
        const duration = 600; // 600ms pulse

        if (elapsed < duration) {
          const t = elapsed / duration;
          setSafePulseRadius(t * 20); // 0 → 20 birim
          setPulseOpacity(0.7 * (1 - t)); // 0.7 → 0
          animFrameRef.current = requestAnimationFrame(animate);
        } else {
          setSafePulseRadius(0);
          setPulseOpacity(0);
        }
      };

      animFrameRef.current = requestAnimationFrame(animate);
    } else if (!snapKey) {
      prevSnapRef.current = null;
    }

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [snappedPoint]);

  return { pulseRadius, pulseOpacity };
}

// ─── Marching Ants Committed Path ───────────────────────────────────────────

const CommittedMarchingAnts: React.FC<{
  points: number[];
  strokeWidth: number;
}> = React.memo(({ points, strokeWidth }) => {
  if (points.length < 4) return null;

  return (
    <MarchingAnts
      points={points}
      stroke="#22c55e"
      strokeWidth={strokeWidth + 1}
      dashSpeed={MARCHING_ANTS_DASH_SPEED_MS}
      opacity={0.85}
    />
  );
});

// ─── Ana Bileşen ────────────────────────────────────────────────────────────

export const LivewirePreview: React.FC<LivewirePreviewProps> = ({ 
  committedPoints, 
  previewLineRef,
  lastSnappedPoint
}) => {
  const scale = useAppStore(state => state.scale);
  const { pulseRadius, pulseOpacity } = useSnapPulse(lastSnappedPoint);
  
  // Scale değerinin 0 veya negatif olmasını engelle (Konva radius negatif kabul etmez)
  const safeScale = Math.max(scale, 0.01);
  const strokeWidth = 2 / safeScale;
  const radius = Math.max(3.5 / safeScale, 0);
  const snapRadius = Math.max(5 / safeScale, 0);
  const dashSize = 6 / safeScale;

  return (
    <Group listening={false}>
      {/* ─── Committed Path (Marching Ants) ─── */}
      {committedPoints.length >= 4 && (
        <CommittedMarchingAnts points={committedPoints} strokeWidth={strokeWidth} />
      )}
      
      {/* Committed path'un altındaki kalın parlak çizgi (glow effect) */}
      <Line
        points={committedPoints}
        stroke="rgba(34, 197, 94, 0.15)"
        strokeWidth={strokeWidth + 6}
        lineJoin="round"
        lineCap="round"
      />

      {/* ─── Live Preview Path (dashed) ─── */}
      <Line
        ref={previewLineRef}
        stroke="#22c55e"
        strokeWidth={strokeWidth}
        dash={[dashSize, dashSize]}
        lineJoin="round"
        lineCap="round"
      />

      {/* ─── Anchor Points ─── */}
      {Array.from({ length: committedPoints.length / 2 }).map((_, i) => {
        const isFirst = i === 0;
        const isLast = i === committedPoints.length / 2 - 1;
        
        return (
          <React.Fragment key={i}>
            {/* Anchor glow */}
            <Circle
              x={committedPoints[i * 2]}
              y={committedPoints[i * 2 + 1]}
              radius={radius + 3}
              fill="rgba(34, 197, 94, 0.2)"
              listening={false}
            />
            {/* Anchor core */}
            <Circle
              x={committedPoints[i * 2]}
              y={committedPoints[i * 2 + 1]}
              radius={radius}
              fill={isFirst ? '#22c55e' : isLast ? '#fbbf24' : '#22c55e'}
              stroke="white"
              strokeWidth={1.5 / safeScale}
              listening={false}
            />
            {/* Anchor ring (first and last get larger ring) */}
            {(isFirst || isLast) && (
              <Circle
                x={committedPoints[i * 2]}
                y={committedPoints[i * 2 + 1]}
                radius={radius + 5}
                stroke="rgba(34, 197, 94, 0.4)"
                strokeWidth={1 / safeScale}
                dash={[2 / safeScale, 2 / safeScale]}
                listening={false}
              />
            )}
          </React.Fragment>
        );
      })}

      {/* ─── Snap Indicator (pulse + core) ─── */}
      {lastSnappedPoint && (
        <>
          {/* Snap pulse animation */}
          {pulseOpacity > 0 && (
            <Circle
              x={lastSnappedPoint.x}
              y={lastSnappedPoint.y}
              radius={pulseRadius}
              fill="rgba(251, 191, 36, 0)"
              stroke="rgba(251, 191, 36, 0.6)"
              strokeWidth={2 / safeScale}
              opacity={pulseOpacity}
              listening={false}
            />
          )}
          {/* Snap core */}
          <Circle
            x={lastSnappedPoint.x}
            y={lastSnappedPoint.y}
            radius={snapRadius}
            fill="#fbbf24"
            stroke="white"
            strokeWidth={2 / safeScale}
            shadowBlur={6 / safeScale}
            shadowColor="black"
            shadowOpacity={0.4}
            listening={false}
          />
          {/* Snap crosshair */}
          <Line
            points={[
              lastSnappedPoint.x - snapRadius * 0.6, lastSnappedPoint.y,
              lastSnappedPoint.x + snapRadius * 0.6, lastSnappedPoint.y,
              lastSnappedPoint.x, lastSnappedPoint.y - snapRadius * 0.6,
              lastSnappedPoint.x, lastSnappedPoint.y + snapRadius * 0.6,
            ]}
            stroke="white"
            strokeWidth={1.5 / safeScale}
            listening={false}
          />
        </>
      )}
    </Group>
  );
};
