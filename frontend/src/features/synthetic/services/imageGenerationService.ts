// frontend/src/features/synthetic/services/imageGenerationService.ts

import type { AIModel, GeneratedImage } from '../types/synthetic.types';

// =============================================================================
// 1. PREDEFINED MODELS - Genişletilmiş model havuzu
// =============================================================================
export const PREDEFINED_MODELS: AIModel[] = [
  // --- OpenAI ---
  {
    id: 'dall-e-3',
    name: 'DALL-E 3',
    provider: 'openai',
    modelId: 'dall-e-3',
    description: 'En yüksek kalite, detaylı ve yaratıcı görseller. 1024x1024, 1792x1024, 1024x1792',
    supportedSizes: ['1024x1024', '1792x1024', '1024x1792'],
    maxPromptLength: 4000,
    requiresApiKey: true,
    apiKeyUrl: 'https://platform.openai.com/api-keys',
  },
  {
    id: 'dall-e-2',
    name: 'DALL-E 2',
    provider: 'openai',
    modelId: 'dall-e-2',
    description: 'Hızlı ve ekonomik görsel üretimi. 256x256, 512x512, 1024x1024',
    supportedSizes: ['256x256', '512x512', '1024x1024'],
    maxPromptLength: 1000,
    requiresApiKey: true,
    apiKeyUrl: 'https://platform.openai.com/api-keys',
  },
  // --- Stability AI ---
  {
    id: 'stable-diffusion-xl',
    name: 'Stable Diffusion XL',
    provider: 'stability',
    modelId: 'stable-diffusion-xl-1024-v1-0',
    description: 'Yüksek kaliteli, açık kaynak AI modeli. 1024x1024',
    supportedSizes: ['1024x1024'],
    maxPromptLength: 2000,
    requiresApiKey: true,
    apiKeyUrl: 'https://platform.stability.ai/account/keys',
  },
  {
    id: 'stable-diffusion-3',
    name: 'Stable Diffusion 3.5',
    provider: 'stability',
    modelId: 'stable-diffusion-3.5-large',
    description: 'En yeni Stability modeli, üstün kalite. 1024x1024',
    supportedSizes: ['1024x1024'],
    maxPromptLength: 2000,
    requiresApiKey: true,
    apiKeyUrl: 'https://platform.stability.ai/account/keys',
  },
  // --- Replicate ---
  {
    id: 'flux-schnell',
    name: 'Flux Schnell',
    provider: 'replicate',
    modelId: 'black-forest-labs/flux-schnell',
    description: 'Black Forest Labs - Hızlı ve kaliteli, açık model',
    supportedSizes: ['1024x1024', '1360x768', '768x1360'],
    maxPromptLength: 2000,
    requiresApiKey: true,
    apiKeyUrl: 'https://replicate.com/account/api-tokens',
  },
  {
    id: 'flux-pro',
    name: 'Flux Pro',
    provider: 'replicate',
    modelId: 'black-forest-labs/flux-pro',
    description: 'Black Forest Labs - Premium kalite görsel üretimi',
    supportedSizes: ['1024x1024', '1360x768', '768x1360'],
    maxPromptLength: 2000,
    requiresApiKey: true,
    apiKeyUrl: 'https://replicate.com/account/api-tokens',
  },
];

// =============================================================================
// 2. PROVIDER STRATEGIES - Her provider için ayrı strateji
// =============================================================================

type GenerateOptions = { size?: string; n?: number };

interface ProviderStrategy {
  generateImage: (
    model: AIModel,
    prompt: string,
    apiKey: string,
    options?: GenerateOptions
  ) => Promise<GeneratedImage>;

  validateApiKey: (apiKey: string) => Promise<{ valid: boolean; message?: string }>;
}

// --- OpenAI Strategy ---
const OPENAI_API_URL = 'https://api.openai.com/v1/images/generations';
const openAIStrategy: ProviderStrategy = {
  generateImage: async (model, prompt, apiKey, options): Promise<GeneratedImage> => {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey.trim()}`,
      },
      body: JSON.stringify({
        model: model.modelId,
        prompt: prompt.trim(),
        n: options?.n || 1,
        size: options?.size || '1024x1024',
        response_format: 'b64_json',
      }),
    });

    if (!response.ok) {
      let errorMessage = `OpenAI API Hatası: ${response.status}`;
      try {
        const errData = await response.json();
        errorMessage = errData.error?.message || errorMessage;
      } catch {
        // use default error message
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();

    if (!data.data?.[0]?.b64_json) {
      throw new Error('OpenAI API yanıtında görsel verisi bulunamadı.');
    }

    const imageData = data.data[0];
    return {
      dataUrl: `data:image/png;base64,${imageData.b64_json}`,
      // revised_prompt varsa kullan
      prompt: imageData.revised_prompt || prompt.trim(),
    } as Partial<GeneratedImage> as GeneratedImage;
  },

  validateApiKey: async (apiKey) => {
    try {
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: { Authorization: `Bearer ${apiKey.trim()}` },
      });
      if (response.ok) return { valid: true };
      if (response.status === 401)
        return { valid: false, message: 'OpenAI API anahtarı geçersiz veya süresi dolmuş.' };
      return { valid: false, message: `OpenAI API yanıt hatası: ${response.status}` };
    } catch {
      return { valid: false, message: 'OpenAI API bağlantısı kurulamadı.' };
    }
  },
};

// --- Stability AI Strategy ---
const STABILITY_API_URL = 'https://api.stability.ai/v2beta/stable-image/generate/sd3';
const stabilityStrategy: ProviderStrategy = {
  generateImage: async (model, prompt, apiKey, options): Promise<GeneratedImage> => {
    const formData = new FormData();
    formData.append('prompt', prompt.trim());
    formData.append('output_format', 'png');
    if (options?.size) {
      formData.append('aspect_ratio', options.size.replace('x', ':'));
    } else {
      formData.append('aspect_ratio', '1:1');
    }

    const response = await fetch(STABILITY_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey.trim()}`,
        Accept: 'application/json',
        // DO NOT set Content-Type - FormData sets it automatically with boundary
      },
      body: formData,
    });

    if (!response.ok) {
      let errorMessage = `Stability AI API Hatası: ${response.status}`;
      try {
        const errData = await response.json();
        errorMessage = errData.message || errData.error || errorMessage;
      } catch {
        // use default error message
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();

    if (!data.image) {
      throw new Error('Stability AI yanıtında görsel verisi bulunamadı.');
    }

    return {
      dataUrl: `data:image/png;base64,${data.image}`,
      prompt: prompt.trim(),
    } as Partial<GeneratedImage> as GeneratedImage;
  },

  validateApiKey: async (apiKey) => {
    try {
      const response = await fetch('https://api.stability.ai/v1/user/account', {
        headers: { Authorization: `Bearer ${apiKey.trim()}` },
      });
      if (response.ok) return { valid: true };
      if (response.status === 401)
        return { valid: false, message: 'Stability AI API anahtarı geçersiz veya süresi dolmuş.' };
      return { valid: false, message: `Stability AI API yanıt hatası: ${response.status}` };
    } catch {
      return { valid: false, message: 'Stability AI API bağlantısı kurulamadı.' };
    }
  },
};

// --- Replicate Strategy ---
const REPLICATE_API_URL = 'https://api.replicate.com/v1/predictions';
const replicateStrategy: ProviderStrategy = {
  generateImage: async (model, prompt, apiKey, options): Promise<GeneratedImage> => {
    // Step 1: Create prediction
    const createResponse = await fetch(REPLICATE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey.trim()}`,
        'Prefer': 'wait',
      },
      body: JSON.stringify({
        version: model.modelId,
        input: {
          prompt: prompt.trim(),
          num_outputs: options?.n || 1,
          aspect_ratio: options?.size ? options.size.replace('x', ':') : '1:1',
          output_format: 'png',
        },
      }),
    });

    if (!createResponse.ok) {
      let errorMessage = `Replicate API Hatası: ${createResponse.status}`;
      try {
        const errData = await createResponse.json();
        errorMessage = errData.detail || errorMessage;
      } catch {
        // use default error message
      }
      throw new Error(errorMessage);
    }

    const prediction = await createResponse.json();

    // Step 2: Handle sync (Prefer: wait) response or poll
    let output = prediction.output;
    if (!output && prediction.urls?.get) {
      // Poll for completion up to 30 seconds
      const maxAttempts = 30;
      const pollUrl = prediction.urls.get;
      for (let i = 0; i < maxAttempts; i++) {
        await new Promise((r) => setTimeout(r, 1000));
        const pollResponse = await fetch(pollUrl, {
          headers: { Authorization: `Bearer ${apiKey.trim()}` },
        });
        const pollData = await pollResponse.json();
        if (pollData.status === 'succeeded') {
          output = pollData.output;
          break;
        }
        if (pollData.status === 'failed') {
          throw new Error(pollData.error || 'Replicate model çalıştırma hatası.');
        }
      }
      if (!output) {
        throw new Error('Replicate zaman aşımı: görsel oluşturulamadı.');
      }
    }

    if (!output || (Array.isArray(output) && output.length === 0)) {
      throw new Error('Replicate yanıtında görsel verisi bulunamadı.');
    }

    // Fetch the image from URL and convert to base64
    const imageUrl = Array.isArray(output) ? output[0] : output;
    const imageResponse = await fetch(imageUrl);
    const imageBlob = await imageResponse.blob();

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve({
          dataUrl: reader.result as string,
          prompt: prompt.trim(),
        } as Partial<GeneratedImage> as GeneratedImage);
      };
      reader.onerror = reject;
      reader.readAsDataURL(imageBlob);
    });
  },

  validateApiKey: async (apiKey) => {
    try {
      const response = await fetch('https://api.replicate.com/v1/account', {
        headers: { Authorization: `Bearer ${apiKey.trim()}` },
      });
      if (response.ok) return { valid: true };
      if (response.status === 401)
        return { valid: false, message: 'Replicate API anahtarı geçersiz veya süresi dolmuş.' };
      return { valid: false, message: `Replicate API yanıt hatası: ${response.status}` };
    } catch {
      return { valid: false, message: 'Replicate API bağlantısı kurulamadı.' };
    }
  },
};

// =============================================================================
// 3. PROVIDER REGISTRY - Provider'ları merkezi olarak yönet
// =============================================================================

const providerRegistry: Record<string, ProviderStrategy> = {
  openai: openAIStrategy,
  stability: stabilityStrategy,
  replicate: replicateStrategy,
};

// =============================================================================
// 4. IMAGE GENERATION SERVICE - Ana servis (BYOK prensibi ile)
// =============================================================================

export const imageGenerationService = {
  /**
   * Returns the list of predefined AI models.
   */
  getModels: (): AIModel[] => PREDEFINED_MODELS,

  /**
   * Finds a model by its ID.
   */
  getModelById: (id: string): AIModel | undefined =>
    PREDEFINED_MODELS.find((m) => m.id === id),

  /**
   * Generates an image using the selected model and API key.
   * The API key is sent directly to the external provider (e.g., OpenAI),
   * NOT to our backend. This ensures user privacy and security.
   *
   * Uses a provider strategy pattern to support multiple AI providers.
   */
  generateImage: async (
    model: AIModel,
    prompt: string,
    apiKey: string,
    options?: { size?: string; n?: number }
  ): Promise<GeneratedImage> => {
    const tempId = `gen_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

    // Validate inputs
    if (!apiKey || apiKey.trim().length < 10) {
      throw new Error('Geçerli bir API anahtarı gerekli.');
    }
    if (!prompt || prompt.trim().length < 3) {
      throw new Error('Prompt en az 3 karakter olmalıdır.');
    }

    // Get the appropriate provider strategy
    const strategy = providerRegistry[model.provider];
    if (!strategy) {
      throw new Error(`Desteklenmeyen AI sağlayıcısı: ${model.provider}`);
    }

    // Delegate to the provider strategy
    const result = await strategy.generateImage(model, prompt, apiKey, options);

    return {
      ...result,
      id: tempId,
      modelId: model.modelId,
      modelName: model.name,
      status: 'completed' as const,
      timestamp: Date.now(),
    } as GeneratedImage;
  },

  /**
   * Validates an API key by making a lightweight request to the provider.
   * Supports multiple providers via the strategy pattern.
   */
  validateApiKey: async (apiKey: string): Promise<{ valid: boolean; message?: string }> => {
    const provider = imageGenerationService.detectProviderFromKey(apiKey);
    if (!provider) {
      return { valid: false, message: 'API anahtarı formatı tanınamadı.' };
    }

    // Map detected provider name to registry key
    const providerMap: Record<string, string> = {
      'OpenAI API': 'openai',
      'Stability AI': 'stability',
      'Replicate': 'replicate',
    };

    const registryKey = providerMap[provider];
    const strategy = registryKey ? providerRegistry[registryKey] : null;

    if (strategy) {
      return strategy.validateApiKey(apiKey);
    }

    // Fallback: generic validation using the detectProviderFromKey
    try {
      const response = await fetch(`https://api.${provider.toLowerCase().replace(' ', '')}.com/v1/models`, {
        headers: { Authorization: `Bearer ${apiKey.trim()}` },
      });
      if (response.ok) return { valid: true };
      return { valid: false, message: 'API anahtarı geçersiz.' };
    } catch {
      return { valid: false, message: 'API bağlantısı kurulamadı. İnternet bağlantınızı kontrol edin.' };
    }
  },

  /**
   * Detects the provider from an API key prefix.
   * Now returns proper provider names for the strategy pattern.
   */
  detectProviderFromKey: (apiKey: string): string | null => {
    const trimmed = apiKey.trim();
    if (trimmed.startsWith('sk-')) return 'OpenAI API';
    if (trimmed.startsWith('r8_')) return 'Replicate';
    if (trimmed.startsWith('sb-')) return 'Stability AI';
    return null;
  },

  /**
   * Returns the list of registered providers.
   */
  getRegisteredProviders: (): string[] => Object.keys(providerRegistry),
};
