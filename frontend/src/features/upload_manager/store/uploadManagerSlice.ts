import type { StateCreator } from 'zustand';

export interface UploadManagerState {
  /** Expanded panel açık mı? */
  isExpanded: boolean;

  /** Tüm yüklemeler terminal durumda mı (başarılı/hatalı/iptal)? */
  allUploadsCompleted: boolean;

  /** Expanded paneli aç */
  expandPanel: () => void;

  /** Expanded paneli kapat (collapse) */
  collapsePanel: () => void;

  /** Aç/kapat toggle */
  togglePanel: () => void;

  /** allUploadsCompleted state'ini güncelle (MiniIsland'dan çağrılır) */
  setAllUploadsCompleted: (completed: boolean) => void;

  /** Tüm state'i sıfırla (tüm yüklemeler silindiğinde) */
  resetUploadManager: () => void;
}

export const createUploadManagerSlice: StateCreator<UploadManagerState> = (set) => ({
  isExpanded: false,
  allUploadsCompleted: false,

  expandPanel: () => set({ isExpanded: true }),
  collapsePanel: () => set({ isExpanded: false }),
  togglePanel: () => set((state) => ({ isExpanded: !state.isExpanded })),
  setAllUploadsCompleted: (completed) => set({ allUploadsCompleted: completed }),
  resetUploadManager: () => set({ isExpanded: false, allUploadsCompleted: false }),
});
