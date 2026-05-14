import { useEffect } from 'react';
import { useAppStore } from '../../store/hooks/useAppStore';
import { maskToPolygon } from '../../features/annotation/tools/sam/samCoords';

export const GlobalKeyboardListener = () => {
  const setKeyPressed = useAppStore(state => state.setKeyPressed);

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

          // Enter → Convert mask to polygon and add as annotation
          if (e.key === 'Enter' && samMaskData && samMaskBlobUrl) {
            e.preventDefault();
            
            const { maskData, width, height } = samMaskData;
            
            // Convert mask to polygon coordinates
            const polygonCoords = maskToPolygon(maskData, width, height, 1.5);
            
            if (polygonCoords.length >= 6) { // At least 3 points (6 coords)
              // Create a new annotated object
              const newId = crypto.randomUUID?.() ?? `sam-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
              
              // Use the first active class or a default
              const taxonomy = state.taxonomy;
              const activeClass = taxonomy?.classes?.find(c => c.isActive);
              const classId = activeClass?.id ?? 'default';
              const className = activeClass?.name ?? 'Object';
              
              const newObject = {
                id: newId,
                label: `${className}_${(state.annotatedObjects?.length ?? 0) + 1}`,
                classId: classId,
                type: 'polygon' as const,
                coordinates: polygonCoords,
                color: activeClass?.color ?? '#3b82f6',
                zIndex: (state.annotatedObjects?.length ?? 0) + 1,
                visible: true,
                locked: false,
              };
              
              // Add to annotated objects
              const currentObjects = state.annotatedObjects ?? [];
              state.setAnnotatedObjects([...currentObjects, newObject]);
            }
            
            // Clear SAM session for the next annotation
            state.clearSamSession();
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
