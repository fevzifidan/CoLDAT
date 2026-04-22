import type { StateCreator } from 'zustand';
import type { Point, ImageDimensions } from '../types/viewer.types';
import { calculateFitAndCenter } from '../utils/centering';

export interface ViewerState {
  scale: number;
  stagePos: Point;
  imgDimensions: ImageDimensions | null;
  containerSize: { width: number; height: number } | null;
  isLoaded: boolean;

  brightness: number;
  contrast: number;
  saturation: number;
  opacity: number;
  isMagnifierActive: boolean;

  setScale: (scale: number) => void;
  setStagePos: (pos: Point) => void;
  setImgDimensions: (dimensions: ImageDimensions) => void;
  setContainerSize: (size: { width: number; height: number }) => void;
  setIsLoaded: (isLoaded: boolean) => void;
  resetViewer: () => void;

  setBrightness: (val: number) => void;
  setContrast: (val: number) => void;
  setSaturation: (val: number) => void;
  setOpacity: (val: number) => void;
  resetFilters: () => void;
  setIsMagnifierActive: (val: boolean) => void;
  zoomIn: () => void;
  zoomOut: () => void;
}

export const createViewerSlice: StateCreator<ViewerState> = (set) => ({
  scale: 1,
  stagePos: { x: 0, y: 0 },
  imgDimensions: null,
  containerSize: null,
  isLoaded: false,

  brightness: 100,
  contrast: 100,
  saturation: 100,
  opacity: 15,
  isMagnifierActive: false,

  setScale: (scale) => set({ scale }),
  setStagePos: (pos) => set({ stagePos: pos }),
  setImgDimensions: (dimensions) => set({ imgDimensions: dimensions }),
  setContainerSize: (size) => set({ containerSize: size }),
  setIsLoaded: (isLoaded) => set({ isLoaded }),
  resetViewer: () => set((state) => {
    let scale = 1;
    let stagePos = { x: 0, y: 0 };

    if (state.containerSize && state.imgDimensions) {
      const result = calculateFitAndCenter(
        state.containerSize.width,
        state.containerSize.height,
        state.imgDimensions.width,
        state.imgDimensions.height
      );
      scale = result.scale;
      stagePos = result.pos;
    }

    return {
      scale,
      stagePos,
      // We keep imgDimensions and isLoaded to keep the image visible
      brightness: 100,
      contrast: 100,
      saturation: 100,
      opacity: 15,
      isMagnifierActive: false,
    };
  }),

  setBrightness: (val) => set({ brightness: val }),
  setContrast: (val) => set({ contrast: val }),
  setSaturation: (val) => set({ saturation: val }),
  setOpacity: (val) => set({ opacity: val }),
  resetFilters: () => set({ brightness: 100, contrast: 100, saturation: 100, opacity: 15 }),
  setIsMagnifierActive: (val) => set({ isMagnifierActive: val }),
  zoomIn: () => set((state) => ({ scale: Math.min(state.scale * 1.2, 5) })),
  zoomOut: () => set((state) => ({ scale: Math.max(state.scale / 1.2, 0.1) })),
});
