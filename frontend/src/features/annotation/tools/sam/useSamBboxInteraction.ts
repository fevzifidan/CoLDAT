/**
 * useSamBboxInteraction.ts
 *
 * Mouse event handler for SAM bounding box prompt drawing on the Konva canvas.
 *
 * ─── Behavior ───────────────────────────────────────────────────────────────
 *   - On mousedown: Start drawing a draft rectangle at the click position
 *   - On mousemove: Update the draft rectangle dimensions in real-time
 *   - On mouseup: Finalize the bbox, store it in Zustand as a SAMBboxPrompt
 *
 * ─── Coordinate System ─────────────────────────────────────────────────────
 * Coordinates are converted from screen space to original image pixel space
 * via getRelativePointerPosition() from useCoordinateTransform.
 * The bbox is stored in image space as { x1, y1, x2, y2 } with x1<x2 and y1<y2.
 *
 * ─── Zoom/Pan Invariance ───────────────────────────────────────────────────
 * getRelativePointerPosition() inverts the Stage transform, so coordinates
 * remain correct regardless of zoom level or pan position.
 *
 * ─── Integration ───────────────────────────────────────────────────────────
 * Used inside InteractionLayer.tsx, wired into the tool dispatch chain.
 * Pass a Konva.Rect ref for draft rectangle rendering.
 */

import { useCallback, useRef } from 'react';
import Konva from 'konva';
import { useAppStore } from '@/store/hooks/useAppStore';
import { useCoordinateTransform } from '../../../viewer/hooks/useCoordinateTransform';
import { clampPoint } from '../../../viewer/utils/coordinateUtils';
import type { SAMBboxPrompt } from '../../types/annotation.types';

// ─── Constants ───────────────────────────────────────────────────────────────

/** Minimum box dimension (in image pixels) for a valid bbox prompt */
const MIN_BBOX_SIZE = 5;

// ─── Hook ────────────────────────────────────────────────────────────────────

export interface UseSamBboxInteractionOptions {
  /** If true, drawing is disabled (e.g., during embedding computation) */
  disabled?: boolean;
  /** Konva Rect ref for rendering the draft rectangle */
  draftRef: React.RefObject<Konva.Rect | null>;
}

export function useSamBboxInteraction(options: UseSamBboxInteractionOptions) {
  const { disabled = false, draftRef } = options;

  const { getRelativePointerPosition } = useCoordinateTransform();
  const isDrawingRef = useRef(false);
  const startPointRef = useRef({ x: 0, y: 0 });

  const handleMouseDown = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (disabled) return;
      if (e.evt.button !== 0) return; // Only left-click for bbox
      if (e.evt.ctrlKey) return; // Ctrl+click pass-through for panning

      const stage = e.target.getStage();
      const imgDims = useAppStore.getState().imgDimensions;
      if (!stage || !imgDims) return;

      const pos = getRelativePointerPosition(stage);
      if (!pos) return;

      const clamped = clampPoint(pos, imgDims.width, imgDims.height);

      isDrawingRef.current = true;
      startPointRef.current = clamped;

      if (draftRef.current) {
        draftRef.current.setAttrs({
          x: clamped.x,
          y: clamped.y,
          width: 0,
          height: 0,
          visible: true,
          stroke: '#22c55e',
          strokeWidth: 2 / (useAppStore.getState().scale || 1),
          dash: [6 / (useAppStore.getState().scale || 1), 4 / (useAppStore.getState().scale || 1)],
          fill: 'rgba(34, 197, 94, 0.08)',
        });
      }
    },
    [disabled, getRelativePointerPosition, draftRef]
  );

  const handleMouseMove = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (!isDrawingRef.current) return;

      const stage = e.target.getStage();
      const imgDims = useAppStore.getState().imgDimensions;
      if (!stage || !imgDims) return;

      const pos = getRelativePointerPosition(stage);
      if (!pos) return;

      const clamped = clampPoint(pos, imgDims.width, imgDims.height);

      if (draftRef.current) {
        const scale = useAppStore.getState().scale || 1;
        draftRef.current.setAttrs({
          width: clamped.x - startPointRef.current.x,
          height: clamped.y - startPointRef.current.y,
          strokeWidth: 2 / scale,
          dash: [6 / scale, 4 / scale],
        });
      }
    },
    [getRelativePointerPosition, draftRef]
  );

  const handleMouseUp = useCallback(
    (_e: Konva.KonvaEventObject<MouseEvent>) => {
      if (!isDrawingRef.current) return;
      isDrawingRef.current = false;

      if (draftRef.current) {
        const attrs = draftRef.current.attrs;
        draftRef.current.visible(false);

        // Prevent accidental tiny boxes
        if (Math.abs(attrs.width) < MIN_BBOX_SIZE || Math.abs(attrs.height) < MIN_BBOX_SIZE) {
          return;
        }

        // Normalize: ensure x1<x2 and y1<y2
        const x1 = Math.min(attrs.x, attrs.x + attrs.width);
        const y1 = Math.min(attrs.y, attrs.y + attrs.height);
        const x2 = Math.max(attrs.x, attrs.x + attrs.width);
        const y2 = Math.max(attrs.y, attrs.y + attrs.height);

        // Store the bbox prompt in Zustand
        // (useSamBboxPrompt setter also clears point prompts)
        const bbox: SAMBboxPrompt = { x1, y1, x2, y2 };
        useAppStore.getState().setSamBboxPrompt(bbox);
      }
    },
    [draftRef]
  );

  return { handleMouseDown, handleMouseMove, handleMouseUp };
}
