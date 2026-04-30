import { useEffect } from 'react';
import { useAppStore } from '../../../store/hooks/useAppStore';

interface HotkeyOptions {
  /** Manuel save callback'i — useAnnotationAutoSave'den gelir */
  onSave?: () => void;
}

export const useAnnotationHotkeys = ({ onSave }: HotkeyOptions = {}) => {
  const setActiveTool = useAppStore(state => state.setActiveTool);
  const isReadOnly = useAppStore(state => state.isReadOnly);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input/textarea
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      // If in read-only mode, block editing-related hotkeys
      if (isReadOnly) {
        // Still allow some navigation hotkeys if needed, 
        // but block Save and Tool switching for now.
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
          e.preventDefault();
        }
        return;
      }

      // Ctrl+S → Manuel Save
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        onSave?.();
        return;
      }

      switch (e.key.toLowerCase()) {
        case 'v':
          setActiveTool('select');
          break;
        case 'r':
          setActiveTool('bbox');
          break;
        case 'p':
          setActiveTool('polygon');
          break;
        case 'h':
          setActiveTool('pan');
          break;
        case 'b':
          setActiveTool('pen');
          break;
        case 'e':
          setActiveTool('eraser');
          break;
        // Add more tools here as they are implemented
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setActiveTool, onSave]);
};
