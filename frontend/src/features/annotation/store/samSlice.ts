/**
 * samSlice.ts
 *
 * Zustand slice for MobileSAM tool state and actions.
 *
 * This slice acts as the central dispatcher between:
 *   - The Web Worker (embedding computation + mask generation)
 *   - The embedding cache (localForage / IndexedDB)
 *   - The backend API (S3 embedding URL check + upload)
 *   - The React UI (prompts, mask rendering, status overlay)
 *
 * State invariants:
 *   - samPrompts are stored in **original image pixel coordinates**.
 *     Conversion to 1024×1024 padded tensor space occurs in the orchestrator
 *     just before sending GENERATE_MASK to the worker.
 *   - samMaskBlobUrl must be a proper object URL (revoked by clearSamMask).
 *   - samStatus drives the visibility of SamProcessingOverlay.
 */

import type { StateCreator } from 'zustand';
import type { SAMStatus, SAMPrompt, SAMBboxPrompt, SAMSubMode, SamState, SamLogitData } from '../types/annotation.types';

export type { SamState };

export const createSamSlice: StateCreator<SamState> = (set) => ({
    // ─── Initial State ──────────────────────────────────────────────────────────
  samStatus: 'idle',
  samDownloadProgress: 0,
  samEmbeddingReady: false,
  samPrompts: [],
  samMaskBlobUrl: null,
  samPromptCount: 0,
  samMaskData: null,
  samLogitData: null,
  samWarning: null,
  samSubMode: 'point' as SAMSubMode,
  samBboxPrompt: null as SAMBboxPrompt | null,

  // ─── Status Setters ─────────────────────────────────────────────────────────

  setSamStatus: (status: SAMStatus) => {
    set({ samStatus: status });
  },

  setSamDownloadProgress: (progress: number) => {
    set({ samDownloadProgress: Math.max(0, Math.min(100, progress)) });
  },

  setSamEmbeddingReady: (ready: boolean) => {
    set({ samEmbeddingReady: ready });
  },

  // ─── Prompt Management ──────────────────────────────────────────────────────

  addSamPrompt: (x: number, y: number, type: 'positive' | 'negative') => {
    set((state) => {
      const newPrompt: SAMPrompt = { x, y, type };
      return {
        samPrompts: [...state.samPrompts, newPrompt],
        samPromptCount: state.samPromptCount + 1,
      };
    });
  },

  removeSamPrompt: (index: number) => {
    set((state) => {
      if (index < 0 || index >= state.samPrompts.length) return state;
      const next = state.samPrompts.filter((_, i) => i !== index);
      return {
        samPrompts: next,
        samPromptCount: next.length,
      };
    });
  },

    clearSamPrompts: () => {
    set({ samPrompts: [], samPromptCount: 0 });
  },

  // ─── Sub-mode Management ──────────────────────────────────────────────────

  setSamSubMode: (mode: SAMSubMode) => {
    set((state) => {
      // Switching sub-modes clears the current prompt type
      const next: Partial<SamState> = { samSubMode: mode };
      if (mode === 'bbox') {
        // Switching to bbox: clear point prompts
        next.samPrompts = [];
        next.samPromptCount = 0;
      } else {
        // Switching to point: clear bbox prompt
        next.samBboxPrompt = null;
      }
      return next;
    });
  },

  setSamBboxPrompt: (bbox: SAMBboxPrompt | null) => {
    set((state) => {
      const next: Partial<SamState> = { samBboxPrompt: bbox };
      if (bbox) {
        // Setting a bbox clears point prompts
        next.samPrompts = [];
        next.samPromptCount = 0;
      }
      return next;
    });
  },

  // ─── Mask Management ────────────────────────────────────────────────────────

  setSamMaskBlobUrl: (url: string | null) => {
    set({ samMaskBlobUrl: url });
  },

  clearSamMask: () => {
    set((state) => {
      // Revoke the old object URL to prevent memory leaks
      if (state.samMaskBlobUrl) {
        URL.revokeObjectURL(state.samMaskBlobUrl);
      }
      return { samMaskBlobUrl: null };
    });
  },

  // ─── Full Reset ─────────────────────────────────────────────────────────────

    resetSamState: () => {
    set((state) => {
      // Revoke the object URL if one exists
      if (state.samMaskBlobUrl) {
        URL.revokeObjectURL(state.samMaskBlobUrl);
      }
      return {
        samStatus: 'idle',
        samDownloadProgress: 0,
        samEmbeddingReady: false,
        samPrompts: [],
        samMaskBlobUrl: null,
        samPromptCount: 0,
        samMaskData: null,
        samLogitData: null,
        samWarning: null,
        samSubMode: 'point' as SAMSubMode,
        samBboxPrompt: null,
      };
    });
  },

  // ─── Clear SAM session (prompts + mask, keep embedding ready) ──────────────

    clearSamSession: () => {
    set((state) => {
      if (state.samMaskBlobUrl) {
        URL.revokeObjectURL(state.samMaskBlobUrl);
      }
      return {
        samPrompts: [],
        samMaskBlobUrl: null,
        samPromptCount: 0,
        samMaskData: null,
        samLogitData: null,
        samWarning: null,
        samBboxPrompt: null,
      };
    });
  },

  // ─── Set raw mask data for polygon conversion ──────────────────────────────

    setSamMaskData: (data: { maskData: Uint8Array; width: number; height: number } | null) => {
    set({ samMaskData: data });
  },

  // ─── Set low-res logit data for d3-contour polygon conversion ────────────

  setSamLogitData: (data: SamLogitData | null) => {
    set({ samLogitData: data });
  },

  // ─── Warning Management ─────────────────────────────────────────────────────

  setSamWarning: (warning: string | null) => {
    set({ samWarning: warning });
  },
});
