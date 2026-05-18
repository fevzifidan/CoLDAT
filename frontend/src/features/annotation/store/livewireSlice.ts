import type { StateCreator } from 'zustand';
import type { LivewireState, LivewireStatus } from '../types/annotation.types';

export const createLivewireSlice: StateCreator<LivewireState> = (set) => ({
  livewireStatus: 'idle',
  livewireProgress: '',

  setLivewireStatus: (status: LivewireStatus) => {
    set({ livewireStatus: status });
  },

  setLivewireProgress: (progress: string) => {
    set({ livewireProgress: progress });
  },

  resetLivewireState: () => {
    set({
      livewireStatus: 'idle',
      livewireProgress: '',
    });
  },
});
