import type { StateCreator } from 'zustand';

export interface UIState {
  currentImageIndex: number;
  totalImages: number;
  activeTab: 'inspector' | 'overview';
  leftPanelCollapsed: boolean;
  rightPanelCollapsed: boolean;
  
  isReadOnly: boolean;
  lastAction: { message: string; timestamp: number } | null;
  setReadOnly: (readOnly: boolean) => void;
  setLastAction: (message: string) => void;
  setCurrentImageIndex: (index: number) => void;
  setTotalImages: (total: number) => void;
  setActiveTab: (tab: 'inspector' | 'overview') => void;
  setLeftPanelCollapsed: (collapsed: boolean) => void;
  setRightPanelCollapsed: (collapsed: boolean) => void;
  goToPrev: () => void;
  goToNext: () => void;
}

export const createUISlice: StateCreator<UIState> = (set) => ({
  currentImageIndex: 0,
  totalImages: 1024,
  activeTab: 'overview',
  leftPanelCollapsed: false,
  rightPanelCollapsed: false,
  isReadOnly: false,
  lastAction: null,
  setReadOnly: (readOnly) => set({ isReadOnly: readOnly }),
  setLastAction: (message) => set({ lastAction: { message, timestamp: Date.now() } }),
  setCurrentImageIndex: (index) => set({ currentImageIndex: index }),
  setTotalImages: (total) => set({ totalImages: total }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setLeftPanelCollapsed: (collapsed) => set({ leftPanelCollapsed: collapsed }),
  setRightPanelCollapsed: (collapsed) => set({ rightPanelCollapsed: collapsed }),
  goToPrev: () => set((state) => ({
    currentImageIndex: Math.max(0, state.currentImageIndex - 1)
  })),
  goToNext: () => set((state) => ({
    currentImageIndex: Math.min(state.totalImages - 1, state.currentImageIndex + 1)
  })),
});
