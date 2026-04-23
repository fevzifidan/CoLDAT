import type { StateCreator } from 'zustand';
import type { AnnotationTool } from '../types/annotation.types';

export interface ToolModeState {
  activeTool: AnnotationTool | 'pan';
  setActiveTool: (tool: AnnotationTool | 'pan') => void;
}

export const createToolModeSlice: StateCreator<ToolModeState> = (set) => ({
  activeTool: 'select',
  setActiveTool: (tool) => set({ activeTool: tool }),
});
