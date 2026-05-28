// frontend/src/features/synthetic/store/syntheticSlice.ts

import { create } from 'zustand';
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
  text: 'Synthetic Görsel Stüdyosu\'na hoş geldiniz! Lütfen önce üst taraftan bir AI modeli seçin ve API anahtarınızı girin. Ardından bir prompt yazarak görsel oluşturabilirsiniz.',
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
  imageToSave: GeneratedImage | null;
  openSaveDialog: (image: GeneratedImage) => void;
  closeSaveDialog: () => void;
}

export const useSyntheticStore = create<SyntheticState>((set, get) => ({
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
          // Try to keep same index position
          const newIdx = Math.min(currentIdx, filtered.length - 1);
          newActiveId = filtered[newIdx]?.id ?? filtered[filtered.length - 1]?.id ?? null;
        } else {
          newActiveId = null;
        }
      }

      return {
        images: filtered,
        activeImageId: newActiveId,
      };
    }),
  setActiveImage: (id) => set({ activeImageId: id }),
  clearAllImages: () => set({ images: [], activeImageId: null }),
  getActiveImage: () => {
    const state = get();
    if (!state.activeImageId) return null;
    return state.images.find((img) => img.id === state.activeImageId) ?? null;
  },

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
  imageToSave: null,
  openSaveDialog: (image) => set({ showSaveDialog: true, imageToSave: image }),
  closeSaveDialog: () => set({ showSaveDialog: false, imageToSave: null }),
}));
