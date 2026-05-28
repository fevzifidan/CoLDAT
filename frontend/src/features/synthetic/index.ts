// frontend/src/features/synthetic/index.ts

export { default as SyntheticPage } from './SyntheticPage';
export { useSyntheticStore } from './store/syntheticSlice';
export { imageGenerationService, PREDEFINED_MODELS } from './services/imageGenerationService';

// Types
export type {
  AIModel,
  AIProvider,
  GeneratedImage,
  ImageFilters,
  ChatMessage,
  WizardStep,
} from './types/synthetic.types';
