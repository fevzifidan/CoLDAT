import type { StateCreator } from 'zustand';
import type { LivewireState, LivewireStatus } from '../types/annotation.types';

export type { LivewireState };

export const createLivewireSlice: StateCreator<LivewireState> = (set) => ({
  livewireStatus: 'idle',
  livewireProgress: '',
  livewireEpsilon: 1.0,

  setLivewireStatus: (status: LivewireStatus) => {
    set({ livewireStatus: status });
  },

  setLivewireProgress: (progress: string) => {
    set({ livewireProgress: progress });
  },

  setLivewireEpsilon: (epsilon: number) => {
    set({ livewireEpsilon: epsilon });
  },

  resetLivewireState: () => {
    set({
      livewireStatus: 'idle',
      livewireProgress: '',
    });
  },
});
