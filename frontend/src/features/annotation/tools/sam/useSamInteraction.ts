/**
 * useSamInteraction.ts
 *
 * Mouse event handler for the SAM tool on the Konva canvas.
 *
 * ─── Click Behavior ──────────────────────────────────────────────────────────
 *   - Left-click (button === 0): Adds a POSITIVE prompt at the clicked location
 *   - Right-click (button === 2): Adds a NEGATIVE prompt at the clicked location
 *
 * Right-click behavior requires onContextMenu prevention at the Stage level
 * (handled in MainStage.tsx) to suppress the browser's default context menu.
 *
 * ─── Coordinate System ──────────────────────────────────────────────────────
 * Coordinates are converted from screen space to original image pixel space
 * via getRelativePointerPosition() from useCoordinateTransform.
 * Prompts are stored in image space in the Zustand store.
 * The orchestrator converts them to model space before sending to the worker.
 *
 * ─── Zoom/Pan Invariance ────────────────────────────────────────────────────
 * getRelativePointerPosition() inverts the Stage transform, so clicks resolve
 * to correct image coordinates regardless of zoom level or pan position.
 *
 * ─── Integration ────────────────────────────────────────────────────────────
 * Used inside InteractionLayer.tsx, wired into the tool dispatch chain:
 *
 *   const { handleMouseDown: samDown } = useSamInteraction();
 *   // ...
 *   if (activeTool === 'sam') samDown(e);
 *
 * ─── Auto-Generation ────────────────────────────────────────────────────────
 * When a prompt is placed, it updates the Zustand store (addSamPrompt).
 * The orchestrator (useSamOrchestrator) has a subscription effect watching
 * samPrompts and automatically triggers mask generation. No callback wiring
 * is needed between the interaction hook and the orchestrator.
 */

import { useCallback, useRef } from 'react';
import Konva from 'konva';
import { useAppStore } from '@/store/hooks/useAppStore';
import { useCoordinateTransform } from '../../../viewer/hooks/useCoordinateTransform';

// ─── Constants ───────────────────────────────────────────────────────────────

/**
 * Minimum distance (in image pixels) between mouse down and mouse up for a click
 * to be considered a valid prompt placement. If the user drags further than this,
 * it's treated as an accidental drag, not a deliberate click.
 *
 * This is consistent with how useDrawBox prevents accidental tiny boxes.
 */
const CLICK_DRAG_THRESHOLD = 5;

// ─── Hook ────────────────────────────────────────────────────────────────────

export interface UseSamInteractionOptions {
  /**
   * If true, clicks are disabled (e.g., during embedding computation).
   * Default: false.
   */
  disabled?: boolean;
  /**
   * SAM sub-mode. When set to 'bbox', this hook defers to the bbox interaction.
   * Point prompts are only placed when subMode is 'point'.
   * Default: 'point'.
   */
  subMode?: 'point' | 'bbox';
}

export function useSamInteraction(options: UseSamInteractionOptions = {}) {
  const { disabled = false, subMode = 'point' } = options;

  const { getRelativePointerPosition } = useCoordinateTransform();

  // Ref to track mouse-down position for drag detection
  const mouseDownPosRef = useRef<{ x: number; y: number } | null>(null);

    const handleMouseDown = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (disabled) return;

      // Only handle point prompts in 'point' sub-mode
      if (subMode !== 'point') return;

      // Ctrl+click should pass through for panning (handled upstream)
      if (e.evt.ctrlKey) return;

      // Only handle left-click (button 0) and right-click (button 2)
      if (e.evt.button !== 0 && e.evt.button !== 2) return;

      const stage = e.target.getStage();
      if (!stage) return;

      const imgDims = useAppStore.getState().imgDimensions;
      if (!imgDims) return;

      // Convert screen position to image pixel coordinates
      const pos = getRelativePointerPosition(stage);
      if (!pos) return;

      // Store mouse-down position for drag detection
      mouseDownPosRef.current = { x: pos.x, y: pos.y };
    },
    [disabled, getRelativePointerPosition]
  );

    const handleMouseUp = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (disabled) return;

      // Only handle point prompts in 'point' sub-mode
      if (subMode !== 'point') return;

      // Ctrl+click pass-through
      if (e.evt.ctrlKey) return;

      // Only handle left-click (button 0) and right-click (button 2)
      if (e.evt.button !== 0 && e.evt.button !== 2) return;

      const stage = e.target.getStage();
      if (!stage) return;

      const imgDims = useAppStore.getState().imgDimensions;
      if (!imgDims) return;

      // Convert screen position to image pixel coordinates
      const pos = getRelativePointerPosition(stage);
      if (!pos) return;

      // Prevent accidental tiny drags from registering as clicks
      // (e.g., if the user slightly moved the mouse between mousedown and mouseup)
      if (mouseDownPosRef.current) {
        const dx = pos.x - mouseDownPosRef.current.x;
        const dy = pos.y - mouseDownPosRef.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > CLICK_DRAG_THRESHOLD) {
          mouseDownPosRef.current = null;
          return; // Was a drag, not a click
        }
      }

      mouseDownPosRef.current = null;

      // Bounds check — clicks outside the image area are invalid
      if (pos.x < 0 || pos.x > imgDims.width || pos.y < 0 || pos.y > imgDims.height) {
        return;
      }

            // Determine prompt type
      const type: 'positive' | 'negative' = e.evt.button === 2 ? 'negative' : 'positive';

      // Clear any existing bbox prompt when placing a point prompt
      useAppStore.getState().setSamBboxPrompt(null);

      // Dispatch to Zustand store.
      // The orchestrator (useSamOrchestrator) watches samPrompts changes
      // via a subscription effect and auto-generates the mask.
      useAppStore.getState().addSamPrompt(pos.x, pos.y, type);
    },
    [disabled, getRelativePointerPosition]
  );

  /**
   * No move handler needed for SAM — the mask only updates on prompt addition,
   * not continuously during mouse movement.
   */
  const handleMouseMove = useCallback(
    (_e: Konva.KonvaEventObject<MouseEvent>) => {
      // Intentionally empty for SAM tool
    },
    []
  );

  return { handleMouseDown, handleMouseMove, handleMouseUp };
}
