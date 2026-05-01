import type { StateCreator } from 'zustand';

export interface Dataset {
  id: string;
  project_id: string;
  name: string;
  description: string;
  current_version: string;
  total_images: number;
  annotated_images: number;
  role: 'admin' | 'annotator' | 'viewer';
}

export interface Task {
  id: string;
  dataset_id: string;
  assignee_id: string;
  role: 'Annotator' | 'Viewer';
  status: 'open' | 'in_progress' | 'approval_pending' | 'completed' | 'rejected';
  rejection_note: string | null;
  image_count: number;
}

export interface ClassDef {
  id: string;
  name: string;
  color: string;
  count?: number;
}

export interface PredicateDef {
  id: string;
  name: string;
  directed?: boolean;
}

export interface Taxonomy {
  classes: ClassDef[];
  predicates: PredicateDef[];
}

export interface ContextState {
  currentDataset: Dataset | null;
  currentTask: Task | null;
  taxonomy: Taxonomy;

  setDatasetContext: (dataset: Dataset | null) => void;
  setTaskContext: (task: Task | null) => void;
  setTaxonomy: (classes: ClassDef[], predicates: PredicateDef[]) => void;
}

export const createContextSlice: StateCreator<ContextState> = (set) => ({
  currentDataset: null,
  currentTask: null,
  taxonomy: { classes: [], predicates: [] },

  setDatasetContext: (dataset) => set({ currentDataset: dataset }),
  setTaskContext: (task) => set({ currentTask: task }),
  setTaxonomy: (classes, predicates) => set({ taxonomy: { classes, predicates } }),
});
