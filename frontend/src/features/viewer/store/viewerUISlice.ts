import type { StateCreator } from 'zustand';

export interface ViewerUIState {
  viewerLeftPanelCollapsed: boolean;
  viewerRightPanelCollapsed: boolean;
  activeViewerTab: 'info' | 'settings';
  
  setViewerLeftPanelCollapsed: (collapsed: boolean) => void;
  setViewerRightPanelCollapsed: (collapsed: boolean) => void;
  setActiveViewerTab: (tab: 'info' | 'settings') => void;
}

export const createViewerUISlice: StateCreator<ViewerUIState> = (set) => ({
  viewerLeftPanelCollapsed: false,
  viewerRightPanelCollapsed: false,
  activeViewerTab: 'info',

  setViewerLeftPanelCollapsed: (collapsed) => set({ viewerLeftPanelCollapsed: collapsed }),
  setViewerRightPanelCollapsed: (collapsed) => set({ viewerRightPanelCollapsed: collapsed }),
  setActiveViewerTab: (tab) => set({ activeViewerTab: tab }),
});
