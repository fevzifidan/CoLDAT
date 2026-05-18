import type { StateCreator } from 'zustand';
import type { AnnotatedObject, ObjectRelation } from '../types/annotation.types';

export interface AnnotationState {
  annotatedObjects: AnnotatedObject[];
  objectRelations: ObjectRelation[];
  selectedObjectId: string | null;
  history: Array<{ objects: AnnotatedObject[]; relations: ObjectRelation[] }>;
  historyIndex: number;
  currentImage: { asset_id: string; filename: string; asset_url: string } | null;
  taskImages: { asset_id: string; filename: string; asset_url: string }[];
  
  // Basic CRUD
  setAnnotatedObjects: (objects: AnnotatedObject[]) => void;
  updateObject: (id: string, patch: Partial<AnnotatedObject>, skipHistory?: boolean) => void;
  deleteObject: (id: string) => void;
  setObjectRelations: (relations: ObjectRelation[]) => void;
  setSelectedObjectId: (id: string | null) => void;
  
  // History
  undo: () => void;
  redo: () => void;
  setCurrentImage: (image: { asset_id: string; filename: string; asset_url: string } | null) => void;
  setTaskImages: (images: { asset_id: string; filename: string; asset_url: string }[]) => void;
}

// @ts-ignore - Accessing combined AppState parts
export const createAnnotationSlice: StateCreator<any> = (set, get) => ({
  annotatedObjects: [],
  objectRelations: [],
  selectedObjectId: null,
  history: [{ objects: [], relations: [] }],
  historyIndex: 0,
  currentImage: null,
  taskImages: [],
  
  setAnnotatedObjects: (objects: AnnotatedObject[]) => {
    set((state) => {
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push({ objects, relations: state.objectRelations });
      if (newHistory.length > 50) newHistory.shift();
      return {
        annotatedObjects: objects,
        history: newHistory,
        historyIndex: newHistory.length - 1,
        lastAction: { message: 'Objects loaded/reset', timestamp: Date.now() }
      };
    });
  },
  
  updateObject: (id: string, patch: Partial<AnnotatedObject>, skipHistory = false) => {
    set((state) => {
      const nextObjects = state.annotatedObjects.map(obj => 
        obj.id === id ? { ...obj, ...patch } : obj
      );

      // Sync relations if label changed
      let nextRelations = state.objectRelations;
      if (patch.label) {
        nextRelations = state.objectRelations.map(rel => {
          if (rel.sourceId === id) return { ...rel, sourceLabel: patch.label! };
          if (rel.targetId === id) return { ...rel, targetLabel: patch.label! };
          return rel;
        });
      }

      if (skipHistory) return { annotatedObjects: nextObjects, objectRelations: nextRelations };

      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push({ objects: nextObjects, relations: nextRelations });
      if (newHistory.length > 50) newHistory.shift();

      const updatedObj = state.annotatedObjects.find(o => o.id === id);
      const actionMsg = patch.classId ? `Class changed: ${updatedObj?.label}` : `Updated: ${patch.label || updatedObj?.label}`;

      return {
        annotatedObjects: nextObjects,
        objectRelations: nextRelations,
        history: newHistory,
        historyIndex: newHistory.length - 1,
        lastAction: { message: actionMsg, timestamp: Date.now() }
      };
    });
  },
  
  deleteObject: (id: string) => {
    set((state) => {
      const deletedObj = state.annotatedObjects.find(o => o.id === id);
      const nextObjects = state.annotatedObjects.filter(obj => obj.id !== id);
      
      // Cleanup relations
      const nextRelations = state.objectRelations.filter(
        rel => rel.sourceId !== id && rel.targetId !== id
      );

      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push({ objects: nextObjects, relations: nextRelations });
      if (newHistory.length > 50) newHistory.shift();
      return {
        annotatedObjects: nextObjects,
        objectRelations: nextRelations,
        selectedObjectId: state.selectedObjectId === id ? null : state.selectedObjectId,
        history: newHistory,
        historyIndex: newHistory.length - 1,
        lastAction: { message: `Deleted: ${deletedObj?.label || id}`, timestamp: Date.now() }
      };
    });
  },

  setObjectRelations: (relations: ObjectRelation[]) => {
    set((state) => {
      const isAddition = relations.length > state.objectRelations.length;
      const isDeletion = relations.length < state.objectRelations.length;
      
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push({ objects: state.annotatedObjects, relations });
      if (newHistory.length > 50) newHistory.shift();

      let msg = 'Relations updated';
      if (isAddition) msg = 'Relation added';
      if (isDeletion) msg = 'Relation deleted';

      return { 
        objectRelations: relations,
        history: newHistory,
        historyIndex: newHistory.length - 1,
        lastAction: { message: msg, timestamp: Date.now() }
      };
    });
  },

  setSelectedObjectId: (id: string | null) => set({ selectedObjectId: id }),
  
  undo: () => set((state) => {
    if (state.historyIndex > 0) {
      const newIndex = state.historyIndex - 1;
      const snapshot = state.history[newIndex];
      return {
        historyIndex: newIndex,
        annotatedObjects: snapshot.objects,
        objectRelations: snapshot.relations,
        lastAction: { message: 'Undo performed', timestamp: Date.now() }
      };
    }
    return state;
  }),
  
  redo: () => set((state) => {
    if (state.historyIndex < state.history.length - 1) {
      const newIndex = state.historyIndex + 1;
      const snapshot = state.history[newIndex];
      return {
        historyIndex: newIndex,
        annotatedObjects: snapshot.objects,
        objectRelations: snapshot.relations,
        lastAction: { message: 'Redo performed', timestamp: Date.now() }
      };
    }
    return state;
  }),

  setCurrentImage: (image) => set({ currentImage: image }),
  setTaskImages: (images) => set({ taskImages: images }),
});
