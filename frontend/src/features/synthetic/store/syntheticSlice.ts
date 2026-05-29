// frontend/src/features/synthetic/store/syntheticSlice.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AIModel, GeneratedImage, ImageFilters, ChatMessage } from '../types/synthetic.types';

const DEFAULT_FILTERS: ImageFilters = {
  invert: false,
  grayscale: false,
  sepia: false,
  blur: 0,
  brightness: 100,
  contrast: 100,
};

const WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome',
  sender: 'ai',
  i18nKey: 'synthetic:chat.welcome',
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
};

interface SyntheticState {
  // Model & API Key
  selectedModel: AIModel | null;
  apiKey: string;
  apiKeyVisible: boolean;
  setSelectedModel: (model: AIModel | null) => void;
  setApiKey: (key: string) => void;
  toggleApiKeyVisibility: () => void;
  clearApiKey: () => void;

  // Generation State
  isGenerating: boolean;
  generationError: string | null;
  setIsGenerating: (val: boolean) => void;
  setGenerationError: (err: string | null) => void;

  // Staging Images
  images: GeneratedImage[];
  activeImageId: string | null;
  addImage: (image: GeneratedImage) => void;
  removeImage: (id: string) => void;
  setActiveImage: (id: string) => void;
  clearAllImages: () => void;
  getActiveImage: () => GeneratedImage | null;

  // Multi-Select & Reorder
  selectedImageIds: string[];
  toggleImageSelection: (id: string) => void;
  selectAllImages: () => void;
  deselectAllImages: () => void;
  selectRange: (fromId: string, toId: string) => void;
  reorderImages: (fromIndex: number, toIndex: number) => void;
  bulkRemoveImages: (ids: string[]) => void;

  // Viewer Settings
  zoom: number;
  rotation: number;
  filters: ImageFilters;
  setZoom: (zoom: number) => void;
  setRotation: (deg: number) => void;
  updateFilters: (filters: Partial<ImageFilters>) => void;
  resetViewer: () => void;

  // Chat Messages
  messages: ChatMessage[];
  addMessage: (msg: ChatMessage) => void;
  clearMessages: () => void;

  // Keep/Discard - Save Dialog
  showSaveDialog: boolean;
  imagesToSave: GeneratedImage[];
  openSaveDialog: (image: GeneratedImage) => void;
  openBulkSaveDialog: (images: GeneratedImage[]) => void;
  closeSaveDialog: () => void;
}

export const useSyntheticStore = create<SyntheticState>()(
  persist(
    (set, get) => ({
      // ---- Model & API Key ----
      selectedModel: null,
      apiKey: '',
      apiKeyVisible: false,
      setSelectedModel: (model) => set({ selectedModel: model }),
      setApiKey: (key) => set({ apiKey: key }),
      toggleApiKeyVisibility: () => set((s) => ({ apiKeyVisible: !s.apiKeyVisible })),
      clearApiKey: () => set({ apiKey: '' }),

      // ---- Generation ----
      isGenerating: false,
      generationError: null,
      setIsGenerating: (val) => set({ isGenerating: val }),
      setGenerationError: (err) => set({ generationError: err }),

      // ---- Staging Images ----
      images: [],
      activeImageId: null,
      addImage: (image) =>
        set((state) => ({
          images: [...state.images, image],
          activeImageId: image.id,
        })),
      removeImage: (id) =>
        set((state) => {
          const filtered = state.images.filter((img) => img.id !== id);
          const currentIdx = state.images.findIndex((img) => img.id === id);
          let newActiveId = state.activeImageId;

          // If we removed the active image, move to next or previous
          if (state.activeImageId === id) {
            if (filtered.length > 0) {
              const newIdx = Math.min(currentIdx, filtered.length - 1);
              newActiveId = filtered[newIdx]?.id ?? filtered[filtered.length - 1]?.id ?? null;
            } else {
              newActiveId = null;
            }
          }

          // Remove from selectedImageIds too
          const updatedSelection = state.selectedImageIds.filter((sid) => sid !== id);

          return {
            images: filtered,
            activeImageId: newActiveId,
            selectedImageIds: updatedSelection,
          };
        }),
      setActiveImage: (id) => set({ activeImageId: id }),
      clearAllImages: () => set({ images: [], activeImageId: null, selectedImageIds: [] }),
      getActiveImage: () => {
        const state = get();
        if (!state.activeImageId) return null;
        return state.images.find((img) => img.id === state.activeImageId) ?? null;
      },

      // ---- Multi-Select & Reorder ----
      selectedImageIds: [],
      toggleImageSelection: (id) =>
        set((state) => {
          const isSelected = state.selectedImageIds.includes(id);
          return {
            selectedImageIds: isSelected
              ? state.selectedImageIds.filter((sid) => sid !== id)
              : [...state.selectedImageIds, id],
          };
        }),
      selectAllImages: () =>
        set((state) => ({
          selectedImageIds: state.images.map((img) => img.id),
        })),
      deselectAllImages: () => set({ selectedImageIds: [] }),
      selectRange: (fromId, toId) =>
        set((state) => {
          const ids = state.images.map((img) => img.id);
          const fromIdx = ids.indexOf(fromId);
          const toIdx = ids.indexOf(toId);
          if (fromIdx === -1 || toIdx === -1) return {};
          const start = Math.min(fromIdx, toIdx);
          const end = Math.max(fromIdx, toIdx);
          const rangeIds = ids.slice(start, end + 1);
          return { selectedImageIds: rangeIds };
        }),
      reorderImages: (fromIndex, toIndex) =>
        set((state) => {
          const newImages = [...state.images];
          const [moved] = newImages.splice(fromIndex, 1);
          newImages.splice(toIndex, 0, moved);
          return { images: newImages };
        }),
      bulkRemoveImages: (ids) =>
        set((state) => {
          const idSet = new Set(ids);
          const remaining = state.images.filter((img) => !idSet.has(img.id));
          let newActiveId = state.activeImageId;

          // If active image was removed, pick a new one
          if (state.activeImageId && idSet.has(state.activeImageId)) {
            newActiveId = remaining.length > 0 ? remaining[0]?.id ?? null : null;
          }

          return {
            images: remaining,
            activeImageId: newActiveId,
            selectedImageIds: [],
          };
        }),

      // ---- Viewer Settings ----
      zoom: 1,
      rotation: 0,
      filters: { ...DEFAULT_FILTERS },
      setZoom: (zoom) => set({ zoom: Math.max(0.1, Math.min(5, zoom)) }),
      setRotation: (deg) => set((s) => ({ rotation: ((s.rotation + deg) % 360 + 360) % 360 })),
      updateFilters: (partial) => set((s) => ({ filters: { ...s.filters, ...partial } })),
      resetViewer: () => set({ zoom: 1, rotation: 0, filters: { ...DEFAULT_FILTERS } }),

      // ---- Chat ----
      messages: [WELCOME_MESSAGE],
      addMessage: (msg) => set((s) => ({ messages: [...s.messages, msg] })),
      clearMessages: () => set({ messages: [WELCOME_MESSAGE] }),

      // ---- Save Dialog ----
      showSaveDialog: false,
      imagesToSave: [],
      openSaveDialog: (image) =>
        set({ showSaveDialog: true, imagesToSave: [image] }),
      openBulkSaveDialog: (images) =>
        set({ showSaveDialog: true, imagesToSave: images }),
      closeSaveDialog: () =>
        set({ showSaveDialog: false, imagesToSave: [] }),
    }),
    {
      name: 'synthetic-studio-storage',
      // Sadece API key ve model bilgisini kalıcı tut
      partialize: (state) => ({
        apiKey: state.apiKey,
        selectedModel: state.selectedModel
          ? { id: state.selectedModel.id, name: state.selectedModel.name, provider: state.selectedModel.provider, modelId: state.selectedModel.modelId, description: state.selectedModel.description, supportedSizes: state.selectedModel.supportedSizes, maxPromptLength: state.selectedModel.maxPromptLength, requiresApiKey: state.selectedModel.requiresApiKey, apiKeyUrl: state.selectedModel.apiKeyUrl }
          : null,
      }),
      merge: (persisted, current) => ({
        ...current,
        ...(persisted as Partial<SyntheticState>),
      }),
    }
  )
);
