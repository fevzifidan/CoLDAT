import type { StateCreator } from 'zustand';
import type { AnnotatedObject, ObjectRelation } from '../types/annotation.types';

export interface AnnotationState {
  annotatedObjects: AnnotatedObject[];
  objectRelations: ObjectRelation[];
  selectedObjectId: string | null;
  history: AnnotatedObject[][];
  historyIndex: number;
  
  // Basic CRUD
  setAnnotatedObjects: (objects: AnnotatedObject[]) => void;
  updateObject: (id: string, patch: Partial<AnnotatedObject>, skipHistory?: boolean) => void;
  deleteObject: (id: string) => void;
  setObjectRelations: (relations: ObjectRelation[]) => void;
  setSelectedObjectId: (id: string | null) => void;
  
  // History
  undo: () => void;
  redo: () => void;
}

export const createAnnotationSlice: StateCreator<AnnotationState> = (set, get) => ({
  annotatedObjects: [],
  objectRelations: [],
  selectedObjectId: null,
  history: [[]],
  historyIndex: 0,
  
  setAnnotatedObjects: (objects) => {
    set((state) => {
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push(objects);
      if (newHistory.length > 50) newHistory.shift();
      return {
        annotatedObjects: objects,
        history: newHistory,
        historyIndex: newHistory.length - 1
      };
    });
  },
  
  updateObject: (id, patch, skipHistory = false) => {
    set((state) => {
      const nextObjects = state.annotatedObjects.map(obj => 
        obj.id === id ? { ...obj, ...patch } : obj
      );

      if (skipHistory) return { annotatedObjects: nextObjects };

      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push(nextObjects);
      if (newHistory.length > 50) newHistory.shift();
      return {
        annotatedObjects: nextObjects,
        history: newHistory,
        historyIndex: newHistory.length - 1
      };
    });
  },
  
  deleteObject: (id) => {
    set((state) => {
      const nextObjects = state.annotatedObjects.filter(obj => obj.id !== id);
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push(nextObjects);
      if (newHistory.length > 50) newHistory.shift();
      return {
        annotatedObjects: nextObjects,
        selectedObjectId: state.selectedObjectId === id ? null : state.selectedObjectId,
        history: newHistory,
        historyIndex: newHistory.length - 1
      };
    });
  },

  setObjectRelations: (relations) => set({ objectRelations: relations }),
  setSelectedObjectId: (id) => set({ selectedObjectId: id }),
  
  undo: () => set((state) => {
    if (state.historyIndex > 0) {
      const newIndex = state.historyIndex - 1;
      return {
        historyIndex: newIndex,
        annotatedObjects: state.history[newIndex],
      };
    }
    return state;
  }),
  
  redo: () => set((state) => {
    if (state.historyIndex < state.history.length - 1) {
      const newIndex = state.historyIndex + 1;
      return {
        historyIndex: newIndex,
        annotatedObjects: state.history[newIndex],
      };
    }
    return state;
  }),
});
