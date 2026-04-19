import { create } from 'zustand';
import type { AnnotatedObject, AnnotationTool, ObjectRelation } from '../types/annotation.types';

interface AnnotationState {
  // Active tool
  activeTool: AnnotationTool;
  setActiveTool: (tool: AnnotationTool) => void;

  // Selected object
  selectedObjectId: string | null;
  setSelectedObjectId: (id: string | null) => void;

  // Annotations
  annotatedObjects: AnnotatedObject[];
  setAnnotatedObjects: (objects: AnnotatedObject[]) => void;
  updateObject: (id: string, patch: Partial<AnnotatedObject>) => void;

  // Object relations
  objectRelations: ObjectRelation[];
  setObjectRelations: (relations: ObjectRelation[]) => void;

  // Navigation
  currentImageIndex: number;
  totalImages: number;
  goToPrev: () => void;
  goToNext: () => void;

  // Right panel active tab
  activeTab: 'inspector' | 'overview';
  setActiveTab: (tab: 'inspector' | 'overview') => void;
}

export const useAnnotationStore = create<AnnotationState>((set, get) => ({
  activeTool: 'bbox',
  setActiveTool: (tool) => set({ activeTool: tool }),

  selectedObjectId: 'obj-1',
  setSelectedObjectId: (id) => set({ selectedObjectId: id }),

  annotatedObjects: [],
  setAnnotatedObjects: (objects) => set({ annotatedObjects: objects }),
  updateObject: (id, patch) =>
    set((state) => ({
      annotatedObjects: state.annotatedObjects.map((o) =>
        o.id === id ? { ...o, ...patch } : o
      ),
    })),

  objectRelations: [],
  setObjectRelations: (relations) => set({ objectRelations: relations }),

  currentImageIndex: 0,
  totalImages: 1024,
  goToPrev: () =>
    set((state) => ({
      currentImageIndex: Math.max(0, state.currentImageIndex - 1),
    })),
  goToNext: () =>
    set((state) => ({
      currentImageIndex: Math.min(state.totalImages - 1, state.currentImageIndex + 1),
    })),

  activeTab: 'overview',
  setActiveTab: (tab) => set({ activeTab: tab }),
}));
