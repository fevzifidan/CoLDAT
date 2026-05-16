import { useEffect, useRef } from 'react';
import { useAppStore } from '../../store/hooks/useAppStore';
import { maskToBoundingBox } from '../../features/annotation/tools/sam/samCoords';
import { logitsToPolygon } from '../../features/annotation/tools/sam/samContour';
import notificationService from '@/shared/services/notification';

export const GlobalKeyboardListener = () => {
  const setKeyPressed = useAppStore(state => state.setKeyPressed);
  // Ref to track if a conversion is in progress to prevent duplicate Enter presses
  const isConvertingRef = useRef(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const isInput = document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA';

      // Prevent default browser behaviors for shortcut combinations
      if (!isInput && (e.ctrlKey || e.metaKey || e.altKey) && !['Control', 'Meta', 'Alt', 'Shift'].includes(e.key)) {
        e.preventDefault();
      }

      if (e.key === 'Control') setKeyPressed('Ctrl', true);
      if (e.key === ' ') {
        // Prevent default page scroll if interacting with app, but be careful with inputs
        if (!isInput) {
          e.preventDefault();
          setKeyPressed('Space', true);
        }
      }
      if (e.key === 'Shift') setKeyPressed('Shift', true);

      // ── SAM Tool Shortcuts ────────────────────────────────────────────
      if (!isInput) {
                const state = useAppStore.getState();
        const activeTool = state.activeTool;
        const samMaskData = state.samMaskData;
        const samLogitData = state.samLogitData;
        const samMaskBlobUrl = state.samMaskBlobUrl;
        const samPromptCount = state.samPromptCount;

        if (activeTool === 'sam') {
          // Backspace → Clear SAM session (prompts + mask)
          if (e.key === 'Backspace' && samPromptCount > 0) {
            e.preventDefault();
            state.clearSamSession();
          }

          // Enter or W → Convert mask to bounding box and add as annotation
          // Uses maskToBoundingBox from samCoords (main-thread, sync, fast).
          if ((e.key === 'Enter' || e.key.toLowerCase() === 'w') && samMaskData && samMaskBlobUrl) {
            e.preventDefault();

            // Prevent duplicate conversions if user mashes Enter/W
            if (isConvertingRef.current) return;
            isConvertingRef.current = true;

            try {
              const { maskData, width, height } = samMaskData;

              // Convert binary mask to bounding box coordinates
              const bbox = maskToBoundingBox(maskData, width, height);

              if (bbox) {
                // Valid bounding box found — create a new annotation
                const currentState = useAppStore.getState();
                const newId = crypto.randomUUID?.() ?? `sam-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

                const taxonomy = currentState.taxonomy;
                const activeClass = taxonomy?.classes?.find((c: { isActive: boolean }) => c.isActive);
                const classId = activeClass?.id ?? 'default';
                const className = activeClass?.name ?? 'Object';

                // Bounding box format: [xMin, yMin, width, height]
                const bboxCoords = [
                  bbox.xMin,
                  bbox.yMin,
                  bbox.xMax - bbox.xMin,
                  bbox.yMax - bbox.yMin,
                ];

                const newObject = {
                  id: newId,
                  label: `${className}_${(currentState.annotatedObjects?.length ?? 0) + 1}`,
                  classId: classId,
                  type: 'bbox' as const,
                  coordinates: bboxCoords,
                  color: activeClass?.color ?? '#3b82f6',
                  zIndex: (currentState.annotatedObjects?.length ?? 0) + 1,
                  visible: true,
                  locked: false,
                };

                const currentObjects = currentState.annotatedObjects ?? [];
                currentState.setAnnotatedObjects([...currentObjects, newObject]);
              } else {
                console.warn('[SAM] No mask found in mask data — skipping annotation creation');
              }

              // Clear SAM session for the next annotation
              useAppStore.getState().clearSamSession();
            } catch (err) {
              console.error('[SAM] Bounding box conversion failed:', err);
              // Still clear the session so the user can try again
              useAppStore.getState().clearSamSession();
            } finally {
              isConvertingRef.current = false;
            }
          }

                    // Q → Convert mask to polygon using d3-contour + simplify-js
          // Uses logit data (low_res_masks from the decoder) for sub-pixel contour detection.
          if (e.key.toLowerCase() === 'q' && state.samLogitData && samMaskBlobUrl) {
            e.preventDefault();
            
            if (isConvertingRef.current) return;
            isConvertingRef.current = true;
            
                        try {
              const { logits, width, height, originalWidth, originalHeight, padX, padY, scaleRatio } = state.samLogitData;
              
              // Run contour detection (main thread — d3-contour is fast on 256x256 grid)
              const coordinates = logitsToPolygon(
                logits,
                width,
                height,
                originalWidth,
                originalHeight,
                padX,
                padY,
                scaleRatio,
                2.0 // epsilon in image pixels for simplify-js
              );
              
              if (coordinates && coordinates.length >= 6) {
                const currentState = useAppStore.getState();
                const newId = crypto.randomUUID?.() ?? `sam-poly-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
                
                const taxonomy = currentState.taxonomy;
                const activeClass = taxonomy?.classes?.find((c: { isActive: boolean }) => c.isActive);
                const classId = activeClass?.id ?? 'default';
                const className = activeClass?.name ?? 'Object';
                
                const newObject = {
                  id: newId,
                  label: `${className}_${(currentState.annotatedObjects?.length ?? 0) + 1}`,
                  classId,
                  type: 'polygon' as const,
                  coordinates,
                  color: activeClass?.color ?? '#3b82f6',
                  zIndex: (currentState.annotatedObjects?.length ?? 0) + 1,
                  visible: true,
                  locked: false,
                };
                
                const currentObjects = currentState.annotatedObjects ?? [];
                currentState.setAnnotatedObjects([...currentObjects, newObject]);
                console.log('[SAM] Polygon annotation created with', coordinates.length / 2, 'points');
              } else {
                console.warn('[SAM] No valid polygon contour found');
                notificationService.warning('No valid polygon contour found. Try adding more prompts.');
              }
              
              // Clear SAM session for the next annotation
              useAppStore.getState().clearSamSession();
            } catch (err) {
              console.error('[SAM] Polygon conversion failed:', err);
              notificationService.error('Polygon conversion failed. Please try again.');
              useAppStore.getState().clearSamSession();
            } finally {
              isConvertingRef.current = false;
            }
          }
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Control') setKeyPressed('Ctrl', false);
      if (e.key === ' ') setKeyPressed('Space', false);
      if (e.key === 'Shift') setKeyPressed('Shift', false);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [setKeyPressed]);

  return null;
};
