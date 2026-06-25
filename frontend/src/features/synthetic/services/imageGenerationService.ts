// frontend/src/features/synthetic/services/imageGenerationService.ts
//
// Frontend-only BYOK implementation.
// The API key is supplied by the user for each request and is never stored here.
// This works only when the selected provider permits browser CORS requests.
// A provider-side CORS rejection cannot be fixed in frontend code; that provider
// will require a backend/serverless proxy.

import type { AIModel, GeneratedImage } from '../types/synthetic.types';

export type ProviderKey = 'google' | 'openai' | 'stability' | 'replicate';
// The public service returns one GeneratedImage, so providers are always asked
// for one output. Keep n for call-site compatibility, but do not bill for and
// discard additional images.
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

const REQUEST_TIMEOUT_MS = 120_000;
const POLL_INTERVAL_MS = 1_500;
const MAX_POLL_ATTEMPTS = 40;

export const PREDEFINED_MODELS: AIModel[] = [
  {
    id: 'gemini-2.5-flash-image',
    name: 'Gemini 2.5 Flash Image',
    provider: 'google' as AIModel['provider'],
    modelId: 'gemini-2.5-flash-image',
    description: 'Google Gemini native image generation.',
    supportedSizes: ['1024x1024'],
    maxPromptLength: 4000,
    requiresApiKey: true,
    apiKeyUrl: 'https://aistudio.google.com/apikey',
  },
  {
    id: 'dall-e-3',
    name: 'DALL-E 3',
    provider: 'openai',
    modelId: 'dall-e-3',
    description: 'OpenAI image generation.',
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
    description: 'OpenAI legacy image generation.',
    supportedSizes: ['256x256', '512x512', '1024x1024'],
    maxPromptLength: 1000,
    requiresApiKey: true,
    apiKeyUrl: 'https://platform.openai.com/api-keys',
  },
  {
    id: 'stable-diffusion-xl',
    name: 'Stable Diffusion XL',
    provider: 'stability',
    modelId: 'stable-diffusion-xl-1024-v1-0',
    description: 'Stability AI SDXL image generation.',
    supportedSizes: ['1024x1024'],
    maxPromptLength: 2000,
    requiresApiKey: true,
    apiKeyUrl: 'https://platform.stability.ai/account/keys',
  },
  {
    id: 'stable-diffusion-3',
    name: 'Stable Diffusion 3.5',
    provider: 'stability',
    modelId: 'sd3.5-large',
    description: 'Stability AI SD3.5 image generation.',
    supportedSizes: ['1024x1024', '1360x768', '768x1360'],
    maxPromptLength: 2000,
    requiresApiKey: true,
    apiKeyUrl: 'https://platform.stability.ai/account/keys',
  },
  {
    id: 'flux-schnell',
    name: 'FLUX Schnell',
    provider: 'replicate',
    modelId: 'black-forest-labs/flux-schnell',
    description: 'Fast FLUX generation through Replicate.',
    supportedSizes: ['1024x1024', '1360x768', '768x1360'],
    maxPromptLength: 2000,
    requiresApiKey: true,
    apiKeyUrl: 'https://replicate.com/account/api-tokens',
  },
  {
    id: 'flux-pro',
    name: 'FLUX Pro',
    provider: 'replicate',
    modelId: 'black-forest-labs/flux-pro',
    description: 'Premium FLUX generation through Replicate.',
    supportedSizes: ['1024x1024', '1360x768', '768x1360'],
    maxPromptLength: 2000,
    requiresApiKey: true,
    apiKeyUrl: 'https://replicate.com/account/api-tokens',
  },
];

function providerOf(model: AIModel): ProviderKey {
  return model.provider as ProviderKey;
}

function selectedSize(model: AIModel, requested?: string): string {
  const size = requested || model.supportedSizes[0];
  if (!model.supportedSizes.includes(size)) {
    throw new Error(`${model.name} modeli ${size} boyutunu desteklemiyor.`);
  }
  return size;
}

function sizeToAspectRatio(size: string): string {
  const [width, height] = size.split('x').map(Number);
  if (!width || !height) return '1:1';

  const ratio = width / height;
  if (ratio > 1.6) return '16:9';
  if (ratio > 1.2) return '3:2';
  if (ratio < 0.625) return '9:16';
  if (ratio < 0.84) return '2:3';
  return '1:1';
}

async function fetchWithTimeout(
  input: RequestInfo | URL,
  init: RequestInit = {},
  timeoutMs = REQUEST_TIMEOUT_MS
): Promise<Response> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error('AI sağlayıcısı zaman aşımına uğradı.');
    }
    if (error instanceof TypeError) {
      throw new Error(
        'AI sağlayıcısına tarayıcıdan bağlanılamadı. CORS engeli varsa backend proxy gerekir.'
      );
    }
    throw error;
  } finally {
    window.clearTimeout(timeout);
  }
}

async function responseError(response: Response, providerName: string): Promise<Error> {
  let message = `${providerName} API hatası: ${response.status}`;
  try {
    const body = await response.json();
    message =
      body?.error?.message ||
      body?.message ||
      body?.detail ||
      body?.error ||
      message;
  } catch {
    // Provider did not return JSON.
  }
  return new Error(String(message));
}

async function remoteImageToDataUrl(url: string): Promise<string> {
  const response = await fetchWithTimeout(url, {}, 60_000);
  if (!response.ok) throw await responseError(response, 'Görsel indirme');

  const blob = await response.blob();
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Üretilen görsel okunamadı.'));
    reader.readAsDataURL(blob);
  });
}

const googleStrategy: ProviderStrategy = {
  generateImage: async (model, prompt, apiKey, options) => {
    // Validate the requested UI size. This service returns one generated image.
    selectedSize(model, options?.size);

    const endpoint =
      `https://generativelanguage.googleapis.com/v1/models/` +
      `${encodeURIComponent(model.modelId)}:generateContent`;

    const response = await fetchWithTimeout(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey.trim(),
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }],
          },
        ],
      }),
    });

    if (!response.ok) throw await responseError(response, 'Google Gemini');
    const data = await response.json();
    const parts =
      data.candidates?.flatMap(
        (candidate: {
          content?: {
            parts?: Array<{ inlineData?: { data?: string; mimeType?: string } }>;
          };
        }) => candidate.content?.parts || []
      ) || [];
    const imagePart = parts.find(
      (part: { inlineData?: { data?: string; mimeType?: string } }) =>
        part.inlineData?.data
    );

    if (!imagePart?.inlineData?.data) {
      throw new Error('Google Gemini yanıtında görsel bulunamadı.');
    }

    const mimeType = imagePart.inlineData.mimeType || 'image/png';
    return {
      dataUrl: `data:${mimeType};base64,${imagePart.inlineData.data}`,
      prompt,
    } as GeneratedImage;
  },

  validateApiKey: async (apiKey) => {
    const response = await fetchWithTimeout(
      'https://generativelanguage.googleapis.com/v1/models',
      { headers: { 'x-goog-api-key': apiKey.trim() } },
      20_000
    );
    if (response.ok) return { valid: true };
    if (response.status === 400 || response.status === 401 || response.status === 403) {
      return { valid: false, message: 'Google API anahtarı geçersiz veya yetkisiz.' };
    }
    return { valid: false, message: `Google API doğrulama hatası: ${response.status}` };
  },
};

const openAIStrategy: ProviderStrategy = {
  generateImage: async (model, prompt, apiKey, options) => {
    const size = selectedSize(model, options?.size);
    const response = await fetchWithTimeout('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey.trim()}`,
      },
      body: JSON.stringify({
        model: model.modelId,
        prompt,
        n: 1,
        size,
        response_format: 'b64_json',
      }),
    });

    if (!response.ok) throw await responseError(response, 'OpenAI');
    const data = await response.json();
    const image = data.data?.[0];
    if (!image?.b64_json) throw new Error('OpenAI yanıtında görsel bulunamadı.');

    return {
      dataUrl: `data:image/png;base64,${image.b64_json}`,
      prompt: image.revised_prompt || prompt,
    } as GeneratedImage;
  },

  validateApiKey: async (apiKey) => {
    const response = await fetchWithTimeout(
      'https://api.openai.com/v1/models',
      { headers: { Authorization: `Bearer ${apiKey.trim()}` } },
      20_000
    );
    if (response.ok) return { valid: true };
    if (response.status === 401) {
      return { valid: false, message: 'OpenAI API anahtarı geçersiz veya süresi dolmuş.' };
    }
    return { valid: false, message: `OpenAI API doğrulama hatası: ${response.status}` };
  },
};

async function generateStabilitySdxl(
  model: AIModel,
  prompt: string,
  apiKey: string,
  options?: GenerateOptions
): Promise<GeneratedImage> {
  const [width, height] = selectedSize(model, options?.size).split('x').map(Number);
  const endpoint = `https://api.stability.ai/v1/generation/${model.modelId}/text-to-image`;
  const response = await fetchWithTimeout(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${apiKey.trim()}`,
    },
    body: JSON.stringify({
      text_prompts: [{ text: prompt, weight: 1 }],
      width,
      height,
      samples: 1,
      steps: 30,
    }),
  });

  if (!response.ok) throw await responseError(response, 'Stability AI');
  const data = await response.json();
  const base64Image = data.artifacts?.[0]?.base64;
  if (!base64Image) throw new Error('Stability AI yanıtında görsel bulunamadı.');

  return { dataUrl: `data:image/png;base64,${base64Image}`, prompt } as GeneratedImage;
}

async function generateStabilitySd3(
  model: AIModel,
  prompt: string,
  apiKey: string,
  options?: GenerateOptions
): Promise<GeneratedImage> {
  const form = new FormData();
  form.append('prompt', prompt);
  form.append('model', model.modelId);
  form.append('aspect_ratio', sizeToAspectRatio(selectedSize(model, options?.size)));
  form.append('output_format', 'png');

  const response = await fetchWithTimeout(
    'https://api.stability.ai/v2beta/stable-image/generate/sd3',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey.trim()}`,
        Accept: 'application/json',
      },
      body: form,
    }
  );

  if (!response.ok) throw await responseError(response, 'Stability AI');
  const data = await response.json();
  if (!data.image) throw new Error('Stability AI yanıtında görsel bulunamadı.');

  return { dataUrl: `data:image/png;base64,${data.image}`, prompt } as GeneratedImage;
}

const stabilityStrategy: ProviderStrategy = {
  generateImage: async (model, prompt, apiKey, options) => {
    if (model.id === 'stable-diffusion-xl') {
      return generateStabilitySdxl(model, prompt, apiKey, options);
    }
    return generateStabilitySd3(model, prompt, apiKey, options);
  },

  validateApiKey: async (apiKey) => {
    const response = await fetchWithTimeout(
      'https://api.stability.ai/v1/user/account',
      { headers: { Authorization: `Bearer ${apiKey.trim()}` } },
      20_000
    );
    if (response.ok) return { valid: true };
    if (response.status === 401) {
      return { valid: false, message: 'Stability AI API anahtarı geçersiz.' };
    }
    return { valid: false, message: `Stability AI doğrulama hatası: ${response.status}` };
  },
};

const replicateStrategy: ProviderStrategy = {
  generateImage: async (model, prompt, apiKey, options) => {
    const endpoint = `https://api.replicate.com/v1/models/${model.modelId}/predictions`;
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey.trim()}`,
      Prefer: 'wait=60',
    };

    const createResponse = await fetchWithTimeout(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        input: {
          prompt,
          num_outputs: 1,
          aspect_ratio: sizeToAspectRatio(selectedSize(model, options?.size)),
          output_format: 'png',
        },
      }),
    });

    if (!createResponse.ok) throw await responseError(createResponse, 'Replicate');
    let prediction = await createResponse.json();

    for (let attempt = 0; !prediction.output && attempt < MAX_POLL_ATTEMPTS; attempt += 1) {
      if (prediction.status === 'failed' || prediction.status === 'canceled') {
        throw new Error(prediction.error || `Replicate işlemi ${prediction.status}.`);
      }
      if (!prediction.urls?.get) break;

      await new Promise((resolve) => window.setTimeout(resolve, POLL_INTERVAL_MS));
      const pollResponse = await fetchWithTimeout(
        prediction.urls.get,
        { headers: { Authorization: `Bearer ${apiKey.trim()}` } },
        30_000
      );
      if (!pollResponse.ok) throw await responseError(pollResponse, 'Replicate');
      prediction = await pollResponse.json();
    }

    const output = Array.isArray(prediction.output) ? prediction.output[0] : prediction.output;
    if (typeof output !== 'string') {
      throw new Error('Replicate zaman aşımına uğradı veya görsel döndürmedi.');
    }

    return { dataUrl: await remoteImageToDataUrl(output), prompt } as GeneratedImage;
  },

  validateApiKey: async (apiKey) => {
    const response = await fetchWithTimeout(
      'https://api.replicate.com/v1/account',
      { headers: { Authorization: `Bearer ${apiKey.trim()}` } },
      20_000
    );
    if (response.ok) return { valid: true };
    if (response.status === 401) {
      return { valid: false, message: 'Replicate API anahtarı geçersiz.' };
    }
    return { valid: false, message: `Replicate doğrulama hatası: ${response.status}` };
  },
};

const providerRegistry: Record<ProviderKey, ProviderStrategy> = {
  google: googleStrategy,
  openai: openAIStrategy,
  stability: stabilityStrategy,
  replicate: replicateStrategy,
};

function configuredModel(model: AIModel): AIModel {
  // Migrate the previously persisted Imagen selection without requiring users
  // to manually clear localStorage after this deployment.
  if (model.id === 'imagen-3' || model.modelId === 'imagen-3.0-generate-002') {
    return PREDEFINED_MODELS.find((candidate) => candidate.id === 'gemini-2.5-flash-image')!;
  }

  return PREDEFINED_MODELS.find((candidate) => candidate.id === model.id) || model;
}

export const imageGenerationService = {
  getModels: (): AIModel[] => PREDEFINED_MODELS,

  getModelById: (id: string): AIModel | undefined => {
    const migratedId = id === 'imagen-3' ? 'gemini-2.5-flash-image' : id;
    return PREDEFINED_MODELS.find((model) => model.id === migratedId);
  },

  generateImage: async (
    model: AIModel,
    rawPrompt: string,
    rawApiKey: string,
    options?: GenerateOptions
  ): Promise<GeneratedImage> => {
    const prompt = rawPrompt.trim();
    const apiKey = rawApiKey.trim();
    const activeModel = configuredModel(model);

    if (apiKey.length < 10) throw new Error('Geçerli bir API anahtarı gerekli.');
    if (prompt.length < 3) throw new Error('Prompt en az 3 karakter olmalıdır.');
    if (prompt.length > activeModel.maxPromptLength) {
      throw new Error(`Prompt en fazla ${activeModel.maxPromptLength} karakter olabilir.`);
    }

    const provider = providerOf(activeModel);
    const strategy = providerRegistry[provider];
    if (!strategy) throw new Error(`Desteklenmeyen AI sağlayıcısı: ${provider}`);

    const result = await strategy.generateImage(activeModel, prompt, apiKey, options);
    return {
      ...result,
      id: `gen_${Date.now()}_${crypto.randomUUID()}`,
      modelId: activeModel.modelId,
      modelName: activeModel.name,
      status: 'completed',
      timestamp: Date.now(),
    };
  },

  // Pass the selected model provider when available. Without it, prefix-based
  // detection is only a convenience and cannot reliably distinguish every key.
  validateApiKey: async (
    apiKey: string,
    provider?: ProviderKey
  ): Promise<{ valid: boolean; message?: string }> => {
    const normalizedKey = apiKey.trim();
    if (normalizedKey.length < 10) {
      return { valid: false, message: 'API anahtarı çok kısa.' };
    }

    const selectedProvider = provider || imageGenerationService.detectProviderFromKey(normalizedKey);
    if (!selectedProvider) {
      return {
        valid: false,
        message: 'API anahtarını doğrulamak için seçili model sağlayıcısı gerekli.',
      };
    }

    try {
      return await providerRegistry[selectedProvider].validateApiKey(normalizedKey);
    } catch (error) {
      return {
        valid: false,
        message: error instanceof Error ? error.message : 'API doğrulaması başarısız.',
      };
    }
  },

  detectProviderFromKey: (apiKey: string): ProviderKey | null => {
    const key = apiKey.trim();
    if (key.startsWith('r8_')) return 'replicate';
    if (key.startsWith('AIza') || key.startsWith('AQ.')) return 'google';
    // OpenAI and Stability key formats may overlap, so do not guess for sk-*.
    return null;
  },

  getRegisteredProviders: (): ProviderKey[] => Object.keys(providerRegistry) as ProviderKey[],
};