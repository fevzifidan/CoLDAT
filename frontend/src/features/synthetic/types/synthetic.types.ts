export type AIProvider = 'openai' | 'stability' | 'replicate';

export interface AIModel {
  id: string;
  name: string;
  provider: AIProvider;
  modelId: string;
  description: string;
  supportedSizes: string[];
  maxPromptLength: number;
  requiresApiKey: boolean;
  apiKeyUrl?: string;
}

export interface GeneratedImage {
  id: string;
  dataUrl: string;
  thumbnailUrl?: string;
  blob?: Blob;
  prompt: string;
  modelId: string;
  modelName: string;
  status: 'generating' | 'completed' | 'failed';
  timestamp: number;
  width?: number;
  height?: number;
  error?: string;
}

export interface ImageFilters {
  invert: boolean;
  grayscale: boolean;
  sepia: boolean;
  blur: number;
  brightness: number;
  contrast: number;
}

export type WizardStep = 'project-selection' | 'dataset-selection' | 'uploading' | 'complete';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  /** @deprecated Use i18nKey + i18nParams instead for dynamic translation */
  text?: string;
  i18nKey?: string;
  i18nParams?: Record<string, string | number | boolean>;
  timestamp: string;
}

