import { useEffect, useRef } from 'react';
import { useAppStore } from '../../store/hooks/useAppStore';
import { sendPolygonWorkerRequest } from '../../features/annotation/tools/sam/useSamOrchestrator';

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
        const samMaskBlobUrl = state.samMaskBlobUrl;
        const samPromptCount = state.samPromptCount;

        if (activeTool === 'sam') {
          // Backspace → Clear SAM session (prompts + mask)
          if (e.key === 'Backspace' && samPromptCount > 0) {
            e.preventDefault();
            state.clearSamSession();
          }

          // Enter → Convert mask to polygon (OFFLOADED TO SHARED WORKER) and add as annotation
          if (e.key === 'Enter' && samMaskData && samMaskBlobUrl) {
            e.preventDefault();

            // Prevent duplicate conversions if user mashes Enter
            if (isConvertingRef.current) return;
            isConvertingRef.current = true;

            const { maskData, width, height } = samMaskData;

            // Run mask → polygon conversion in the shared singleton worker (non-blocking).
            // Uses the same worker instance as useSamOrchestrator to avoid a second
            // independent worker whose PING/PONG handshake could race and time out.
            sendPolygonWorkerRequest('MASK_TO_POLYGON', {
              maskData,
              width,
              height,
              epsilon: 1.5,
            })
              .then((result: unknown) => {
                const { coordinates } = result as { coordinates: number[] };

                if (coordinates.length >= 6) {
                  // At least 3 points (6 coords) — create a new annotation
                  const currentState = useAppStore.getState();
                  const newId = crypto.randomUUID?.() ?? `sam-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

                  const taxonomy = currentState.taxonomy;
                  const activeClass = taxonomy?.classes?.find((c: { isActive: boolean }) => c.isActive);
                  const classId = activeClass?.id ?? 'default';
                  const className = activeClass?.name ?? 'Object';

                  const newObject = {
                    id: newId,
                    label: `${className}_${(currentState.annotatedObjects?.length ?? 0) + 1}`,
                    classId: classId,
                    type: 'polygon' as const,
                    coordinates: coordinates,
                    color: activeClass?.color ?? '#3b82f6',
                    zIndex: (currentState.annotatedObjects?.length ?? 0) + 1,
                    visible: true,
                    locked: false,
                  };

                  const currentObjects = currentState.annotatedObjects ?? [];
                  currentState.setAnnotatedObjects([...currentObjects, newObject]);
                }

                // Clear SAM session for the next annotation
                useAppStore.getState().clearSamSession();
              })
              .catch((err: Error) => {
                console.error('[SAM] Polygon conversion failed:', err);
                // Still clear the session so the user can try again
                useAppStore.getState().clearSamSession();
              })
              .finally(() => {
                isConvertingRef.current = false;
              });
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
