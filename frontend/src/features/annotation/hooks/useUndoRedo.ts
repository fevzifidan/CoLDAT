import { useEffect } from 'react';
import { useAppStore } from '../../../store/hooks/useAppStore';
import { Logger } from '@/shared/services/logging/logging';

export const useUndoRedo = () => {
  const undo = useAppStore(state => state.undo);
  const redo = useAppStore(state => state.redo);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          try { redo(); } catch (error) { Logger.error("Undo/Redo failed", { direction: 'redo', error }); }
        } else {
          try { undo(); } catch (error) { Logger.error("Undo/Redo failed", { direction: 'undo', error }); }
        }
      } else if (e.ctrlKey && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        try { redo(); } catch (error) { Logger.error("Undo/Redo failed", { direction: 'redo', error }); }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);
};
