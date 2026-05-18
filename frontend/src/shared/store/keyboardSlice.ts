import type { StateCreator } from 'zustand';

export interface KeyboardState {
  isSpacePressed: boolean;
  isCtrlPressed: boolean;
  isShiftPressed: boolean;

  setKeyPressed: (key: 'Space' | 'Ctrl' | 'Shift', isPressed: boolean) => void;
  resetKeys: () => void;
}

export const createKeyboardSlice: StateCreator<KeyboardState> = (set) => ({
  isSpacePressed: false,
  isCtrlPressed: false,
  isShiftPressed: false,

  setKeyPressed: (key, isPressed) => set((state) => {
    switch (key) {
      case 'Space': return { isSpacePressed: isPressed };
      case 'Ctrl': return { isCtrlPressed: isPressed };
      case 'Shift': return { isShiftPressed: isPressed };
      default: return state;
    }
  }),
  resetKeys: () => set({ isSpacePressed: false, isCtrlPressed: false, isShiftPressed: false }),
});
