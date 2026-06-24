import { useEffect } from 'react';
import { useAppStore } from '../../../store/hooks/useAppStore';

export const useUndoRedo = () => {
  const undo = useAppStore(state => state.undo);
  const redo = useAppStore(state => state.redo);
  const isReadOnly = useAppStore(state => state.isReadOnly);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 🔒 Read-only modda undo/redo klavye kısayollarını tamamen blokla
      if (useAppStore.getState().isReadOnly) return;

      if (e.ctrlKey && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      } else if (e.ctrlKey && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, isReadOnly]);
};
