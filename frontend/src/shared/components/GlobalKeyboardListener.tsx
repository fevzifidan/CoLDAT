import { useEffect } from 'react';
import { useAppStore } from '../../store/hooks/useAppStore';

export const GlobalKeyboardListener = () => {
  const setKeyPressed = useAppStore(state => state.setKeyPressed);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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
