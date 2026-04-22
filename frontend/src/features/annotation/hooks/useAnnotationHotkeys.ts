import { useEffect } from 'react';
import { useAppStore } from '../../../store/hooks/useAppStore';

export const useAnnotationHotkeys = () => {
  const setActiveTool = useAppStore(state => state.setActiveTool);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input/textarea
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
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
  }, [setActiveTool]);
};
