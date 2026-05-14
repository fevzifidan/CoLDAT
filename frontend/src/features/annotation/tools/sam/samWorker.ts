/**
 * samWorker.ts
 *
 * Web Worker for MobileSAM inference using ONNX Runtime Web.
 *
 * ─── Thread Isolation ───────────────────────────────────────────────────────
 * ALL ONNX inference (both Encoder and Decoder) runs exclusively inside this
 * worker. The UI thread never blocks.
 *
 * ─── Execution Providers (Fallback Chain) ───────────────────────────────────
 * Initialized with `['webgpu', 'webgl', 'wasm']` to prioritize GPU acceleration
 * with a CPU fallback. ONNX Runtime automatically tries each provider in order
 * and falls back if the hardware/driver doesn't support it.
 *
 * ─── Transferable Objects ──────────────────────────────────────────────────
 * All ArrayBuffer transfers between the UI thread and this worker use
 * Transferable Objects via the `transferList` parameter of postMessage().
 * This avoids structured cloning overhead for multi-MB embeddings.
 *
 * ─── Message Protocol ──────────────────────────────────────────────────────
 *   INIT_MODELS       : Load encoder/decoder ONNX models into InferenceSession
 *   COMPUTE_EMBEDDING : Preprocess image, run encoder, return ArrayBuffer
 *   LOAD_EMBEDDING    : Load pre-computed embedding into worker memory
 *   GENERATE_MASK     : Run decoder with prompts + stored embedding → mask tensor
 *
 * ─── Coordinate System ─────────────────────────────────────────────────────
 * This worker operates in PADDED 1024×1024 tensor space.
 * The UI thread is responsible for converting click coordinates to model space
 * BEFORE sending GENERATE_MASK (using samCoords.ts utility functions).
 */

// @ts-ignore — onnxruntime-web types may not resolve perfectly in dev
import * as ort from 'onnxruntime-web';

// ─── ONNX Runtime Web WASM Yapılandırması ──────────────────────────────────
// Worker içinde WASM dosyaları doğrudan `node_modules/` yolundan yüklenemez.
// Bu nedenle CDN üzerinden yüklemeyi yapılandırıyoruz.
// NOT: Bu satır `import`'tan hemen sonra çalıştırılmalıdır.
ort.env.wasm.wasmPaths = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.26.0/dist/';

// SIMD ve multi-threading desteğini etkinleştir (WASM performansını artırır)
ort.env.wasm.simd = true;

// ─── Types ───────────────────────────────────────────────────────────────────

interface PromptMessage {
  x: number;
  y: number;
  type: 'positive' | 'negative';
}

interface PointCoords {
  x: number;
  y: number;
}

interface WorkerMessage {
  type: 'INIT_MODELS' | 'COMPUTE_EMBEDDING' | 'LOAD_EMBEDDING' | 'GENERATE_MASK';
  data: Record<string, unknown>;
}

// ─── Internal State ─────────────────────────────────────────────────────────

/**
 * ONNX InferenceSession instances for the encoder and decoder models.
 * These are created once during INIT_MODELS and reused for all subsequent
 * COMPUTE_EMBEDDING and GENERATE_MASK calls.
 */
let encoderSession: ort.InferenceSession | null = null;
let decoderSession: ort.InferenceSession | null = null;

/**
 * The current image embedding tensor kept in worker memory.
 * This is set by either COMPUTE_EMBEDDING (local computation) or
 * LOAD_EMBEDDING (from S3/IDB cache) and consumed by GENERATE_MASK.
 */
let currentEmbedding: ort.Tensor | null = null;

/**
 * The original image dimensions sent alongside COMPUTE_EMBEDDING,
 * needed by GENERATE_MASK to set decoder auxiliary inputs correctly.
 */
let currentImageDims: { w: number; h: number } | null = null;

/**
 * Whether the worker has been initialized with models.
 */
let isInitialized = false;

// ─── Constants ──────────────────────────────────────────────────────────────

/** MobileSAM fixed input/output tensor size */
const MODEL_SIZE = 1024;

/**
 * Default execution provider priority chain.
 * ONNX Runtime will try webgpu first, fall back to webgl, then wasm.
 */
const EXECUTION_PROVIDERS: ort.InferenceSession.ExecutionProviderName[] = [
  'webgpu',
  'webgl',
  'wasm',
];

// ─── Logging Helper ──────────────────────────────────────────────────────────

function logDebug(...args: unknown[]): void {
  self.postMessage({
    type: 'LOG',
    data: { args },
  });
}

// ─── Model Initialization ────────────────────────────────────────────────────

/**
 * Create ONNX Runtime InferenceSessions for the encoder and decoder models.
 *
 * Both models must be available as static assets (e.g., in public/models/).
 * The paths are provided by the UI thread in the INIT_MODELS message.
 *
 * @param encoderPath — URL/path to the MobileSAM encoder ONNX model
 * @param decoderPath — URL/path to the MobileSAM decoder ONNX model
 */
async function initModels(
  encoderPath: string,
  decoderPath: string
): Promise<void> {
  const startTime = performance.now();
  logDebug('[SAM Worker] Initializing models...');

  // ── Encoder Session ──────────────────────────────────────────────────────
  logDebug('[SAM Worker] Loading encoder:', encoderPath);
  
  // Önce bir HEAD isteği yaparak modelin erişilebilir olduğunu kontrol edelim
  try {
    const headResponse = await fetch(encoderPath, { method: 'HEAD' });
    logDebug('[SAM Worker] Encoder HEAD:', headResponse.status, headResponse.headers.get('content-type'));
  } catch (e) {
    logDebug('[SAM Worker] Encoder HEAD failed:', e);
  }
  
  encoderSession = await ort.InferenceSession.create(encoderPath, {
    executionProviders: EXECUTION_PROVIDERS,
    graphOptimizationLevel: 'all',
    enableCpuMemArena: true,
  });
  logDebug(
    '[SAM Worker] Encoder loaded in',
    Math.round(performance.now() - startTime),
    'ms'
  );

  // ── Decoder Session ──────────────────────────────────────────────────────
  const decoderStart = performance.now();
  logDebug('[SAM Worker] Loading decoder:', decoderPath);
  decoderSession = await ort.InferenceSession.create(decoderPath, {
    executionProviders: EXECUTION_PROVIDERS,
    graphOptimizationLevel: 'all',
    enableCpuMemArena: true,
  });
  logDebug(
    '[SAM Worker] Decoder loaded in',
    Math.round(performance.now() - decoderStart),
    'ms'
  );

  isInitialized = true;
  logDebug(
    '[SAM Worker] All models ready. Total init:',
    Math.round(performance.now() - startTime),
    'ms'
  );
}

// ─── Image Preprocessing ─────────────────────────────────────────────────────

/**
 * Preprocess an ImageData for the MobileSAM encoder.
 *
 * Steps:
 *   1. Longest-edge resize to 1024 (maintaining aspect ratio)
 *   2. Center-pad to 1024×1024 with zeros
 *   3. Normalize pixel values to [0, 1]
 *   4. Convert from HWC (height, width, channels) to NCHW (batch, channels, height, width)
 *   5. Apply MobileSAM-specific mean/std normalization
 *
 * MobileSAM preprocessing normalization constants (from original implementation):
 *   mean = [123.675, 116.28, 103.53]
 *   std  = [58.395, 57.12, 57.375]
 *
 * @param imageData — Raw ImageData (RGBA) from OffscreenCanvas
 * @param originalWidth — Original image width
 * @param originalHeight — Original image height
 * @returns A Float32Array of size 1×3×1024×1024 (NCHW layout)
 */
function preprocessImage(
  imageData: ImageData,
  originalWidth: number,
  originalHeight: number,
  outputDims: { padX: number; padY: number; scaledW: number; scaledH: number }
): Float32Array {
  const { padX, padY, scaledW, scaledH } = outputDims;
  const size = MODEL_SIZE;
  const tensor = new Float32Array(1 * 3 * size * size);
  const pixels = imageData.data;

  // Normalization constants (MobileSAM / SAM from mmseg)
  const meanR = 123.675;
  const meanG = 116.28;
  const meanB = 103.53;
  const stdR = 58.395;
  const stdG = 57.12;
  const stdB = 57.375;

  // Fill tensor in NCHW layout
  // For each pixel position in the scaled image:
  //   tensor[0][c][padY + scaledY][padX + scaledX] = (pixel[c] - mean[c]) / std[c]
  for (let sy = 0; sy < scaledH; sy++) {
    for (let sx = 0; sx < scaledW; sx++) {
      // Find source pixel in original image using nearest-neighbor scaling
      const srcX = Math.round((sx / scaledW) * originalWidth);
      const srcY = Math.round((sy / scaledH) * originalHeight);
      const clampedSrcX = Math.min(originalWidth - 1, Math.max(0, srcX));
      const clampedSrcY = Math.min(originalHeight - 1, Math.max(0, srcY));

      const srcIdx = (clampedSrcY * originalWidth + clampedSrcX) * 4;
      const r = pixels[srcIdx];
      const g = pixels[srcIdx + 1];
      const b = pixels[srcIdx + 2];

      const dstY = padY + sy;
      const dstX = padX + sx;
      const dstIdx = dstY * size + dstX;

      // Channel 0 (R)
      tensor[0 * size * size + dstIdx] = (r - meanR) / stdR;
      // Channel 1 (G)
      tensor[1 * size * size + dstIdx] = (g - meanG) / stdG;
      // Channel 2 (B)
      tensor[2 * size * size + dstIdx] = (b - meanB) / stdB;
    }
  }

  // Padded regions remain zero (already initialized to 0 by Float32Array)

  return tensor;
}

// ─── Embedding Computation ───────────────────────────────────────────────────

/**
 * Run the MobileSAM encoder on the preprocessed image tensor.
 *
 * @param preprocessed — Float32Array of size 1×3×1024×1024 (NCHW)
 * @returns The embedding tensor (as Float32Array for Transferable transport)
 */
async function computeEmbedding(
  tensorData: Float32Array
): Promise<Float32Array> {
  if (!encoderSession) {
    throw new Error('[SAM Worker] Encoder session not initialized. Send INIT_MODELS first.');
  }

  const size = MODEL_SIZE;

  // Create ONNX tensor from the preprocessed data
  const inputTensor = new ort.Tensor('float32', tensorData, [1, 3, size, size]);

  // Run encoder
  const feeds: Record<string, ort.Tensor> = {};
  // The input name depends on the model; typically 'input' or 'pixel_values'
  // We try to detect it from the session input names
  const inputNames = encoderSession.inputNames;
  if (inputNames.length === 0) {
    throw new Error('[SAM Worker] Encoder session has no input names.');
  }
  feeds[inputNames[0]] = inputTensor;

  const results = await encoderSession.run(feeds);

  // Get the output — typically the first (and only) output
  const outputNames = encoderSession.outputNames;
  if (outputNames.length === 0) {
    throw new Error('[SAM Worker] Encoder session has no output names.');
  }

  const outputTensor = results[outputNames[0]];
  const embeddingData = outputTensor.data as Float32Array;

  return embeddingData;
}

// ─── Mask Generation ─────────────────────────────────────────────────────────

/**
 * Run the MobileSAM decoder with the stored embedding and user prompts.
 *
 * The decoder expects:
 *   - image_embeddings: The embedding tensor from the encoder
 *   - point_coords:     Tensor of shape [N, 2] — prompt coordinates in 1024×1024 space
 *   - point_labels:     Tensor of shape [N]    — 1 for positive, 0 for negative
 *   - mask_input:       Zero tensor of shape [1, 1, 256, 256] (iterative refinement unused)
 *   - has_mask_input:   Tensor with value 0.0 (no mask input)
 *   - orig_im_size:     Tensor of shape [2] — original image dimensions [H, W]
 *
 * @param prompts — Array of prompts in 1024×1024 model coordinates
 * @returns The raw mask output tensor (Float32Array of size 1024×1024)
 */
async function generateMask(
  prompts: PromptMessage[],
  originalWidth: number,
  originalHeight: number
): Promise<{ data: Float32Array; width: number; height: number }> {
  if (!decoderSession) {
    throw new Error('[SAM Worker] Decoder session not initialized. Send INIT_MODELS first.');
  }
  if (!currentEmbedding) {
    throw new Error('[SAM Worker] No embedding loaded. Send COMPUTE_EMBEDDING or LOAD_EMBEDDING first.');
  }

  const numPoints = prompts.length;

  // ── Build point_coords tensor [N, 2] ─────────────────────────────────────
  const pointCoordsData = new Float32Array(numPoints * 2);
  const pointLabelsData = new Float32Array(numPoints);

  for (let i = 0; i < numPoints; i++) {
    const p = prompts[i];
    pointCoordsData[i * 2] = p.x;
    pointCoordsData[i * 2 + 1] = p.y;
    pointLabelsData[i] = p.type === 'positive' ? 1.0 : 0.0;
  }

  // MobileSAM decoder expects batch dimension: [1, numPoints, 2] and [1, numPoints]
  const pointCoordsTensor = new ort.Tensor('float32', pointCoordsData, [1, numPoints, 2]);
  const pointLabelsTensor = new ort.Tensor('float32', pointLabelsData, [1, numPoints]);

  // ── Build mask_input tensor (zero) ──────────────────────────────────────
  // MobileSAM doesn't use iterative mask refinement from the decoder,
  // but the model still expects this input. We provide a zero tensor.
  const maskInputData = new Float32Array(1 * 1 * 256 * 256).fill(0);
  const maskInputTensor = new ort.Tensor('float32', maskInputData, [1, 1, 256, 256]);

  // ── Build has_mask_input tensor ─────────────────────────────────────────
  const hasMaskInputData = new Float32Array([0.0]);
  const hasMaskInputTensor = new ort.Tensor('float32', hasMaskInputData, [1]);

  // ── Build orig_im_size tensor ───────────────────────────────────────────
  // Note: Some SAM decoder variants expect [H, W] order
  const origImSizeData = new Float32Array([originalHeight, originalWidth]);
  const origImSizeTensor = new ort.Tensor('float32', origImSizeData, [2]);

  // ── Prepare feeds ───────────────────────────────────────────────────────
  const inputNames = decoderSession.inputNames;

  // Build feeds by matching input names (model-dependent naming)
  const feeds: Record<string, ort.Tensor> = {};

  // We match expected names against the model's actual input names
  // Common SAM decoder input names:
  //   'image_embeddings', 'point_coords', 'point_labels',
  //   'mask_input', 'has_mask_input', 'orig_im_size'
  for (const name of inputNames) {
    if (name.toLowerCase().includes('image') || name.toLowerCase().includes('embedding')) {
      feeds[name] = currentEmbedding;
    } else if (name.toLowerCase().includes('point_coords') || name.toLowerCase().includes('pointcoords')) {
      feeds[name] = pointCoordsTensor;
    } else if (name.toLowerCase().includes('point_labels') || name.toLowerCase().includes('pointlabels')) {
      feeds[name] = pointLabelsTensor;
    } else if (name.toLowerCase().includes('has_mask_input') || name.toLowerCase().includes('hasmaskinput')) {
      // IMPORTANT: Check has_mask_input BEFORE mask_input to avoid false match!
      feeds[name] = hasMaskInputTensor;
    } else if (name.toLowerCase().includes('mask_input') || name.toLowerCase().includes('maskinput')) {
      feeds[name] = maskInputTensor;
    } else if (name.toLowerCase().includes('orig_im_size') || name.toLowerCase().includes('origimsize')) {
      feeds[name] = origImSizeTensor;
    }
  }

  // If matching failed, log an error
  if (Object.keys(feeds).length === 0) {
    throw new Error(
      `[SAM Worker] Could not match decoder input names. Available: [${inputNames.join(', ')}]`
    );
  }

  // ── Run decoder ─────────────────────────────────────────────────────────
  const results = await decoderSession.run(feeds);

  // Find the mask output — look for 'masks' or 'low_res_masks' first
  const outputNames = decoderSession.outputNames;
  logDebug('[SAM Worker] Decoder output names:', outputNames);

  // Try to find the mask output (prefer 'masks' over 'low_res_masks')
  let maskOutputName = outputNames[0];
  for (const name of outputNames) {
    const lower = name.toLowerCase();
    if (lower === 'masks') {
      maskOutputName = name;
      break;
    }
  }

  const outputTensor = results[maskOutputName];
  
  // Log ALL outputs for debugging purposes
  for (const name of outputNames) {
    const t = results[name];
    const d = t.data as any;
    logDebug('[SAM Worker] Output', name, 'dims:', t.dims, 'type:', t.type, 'len:', d?.length, 'first5:', d?.subarray ? Array.from(d.subarray(0, Math.min(5, d.length))) : 'N/A');
  }
  
  const rawData = outputTensor.data as any;
  logDebug('[SAM Worker] outputTensor type:', typeof rawData, 'constructor:', rawData?.constructor?.name, 'length:', rawData?.length);
  logDebug('[SAM Worker] outputTensor dims:', outputTensor.dims, 'type:', outputTensor.type);
  
  // Get the data correctly based on tensor type
  let outputData: Float32Array;
  if (outputTensor.type === 'float32') {
    outputData = rawData as Float32Array;
  } else if (outputTensor.type === 'float64') {
    // Convert Float64Array to Float32Array
    const float64 = rawData as Float64Array;
    outputData = new Float32Array(float64);
  } else {
    // Try direct cast
    outputData = new Float32Array(rawData);
  }
  
  // Check first few values
  if (outputData && outputData.length > 0) {
    logDebug('[SAM Worker] First 5 values:', Array.from(outputData.subarray(0, Math.min(5, outputData.length))));
    logDebug('[SAM Worker] Is NaN check:', outputData.subarray(0, 5).map(v => isNaN(v)));
  } else {
    logDebug('[SAM Worker] outputData is empty or null');
  }

  // The output shape depends on the model variant
  // It could be [1, 1, 256, 256] (low-res) or [1, 1, 1024, 1024] (full-res)
  // We always return as Float32Array at MODEL_SIZE × MODEL_SIZE
  const outputDims = outputTensor.dims;
  logDebug('[SAM Worker] Mask output shape:', outputDims);

  let resultData: Float32Array;
  let resultWidth: number;
  let resultHeight: number;

  if (outputDims.length === 4 && outputDims[2] > 0 && outputDims[3] > 0) {
    // Model output is already at some resolution [1, 1, H, W].
    // Extract the first channel and pass it through as-is.
    // The UI thread's cropAndScaleMask() will handle scaling to original dims.
    const h = outputDims[2];
    const w = outputDims[3];
    logDebug('[SAM Worker] Mask output shape:', outputDims, '- extracting first channel as', w, 'x', h);
    const ch0 = outputData.subarray(0, h * w);
    resultData = new Float32Array(ch0);
    resultWidth = w;
    resultHeight = h;
  } else {
    // Unknown shape — attempt to use raw data
    logDebug('[SAM Worker] Unexpected output shape:', outputDims, '. Using raw data.');
    resultData = new Float32Array(outputData);
    resultWidth = MODEL_SIZE;
    resultHeight = MODEL_SIZE;
  }

  // Log some stats about the mask for debugging
  let minV = Infinity, maxV = -Infinity;
  for (let i = 0; i < Math.min(resultData.length, 100); i++) {
    if (resultData[i] < minV) minV = resultData[i];
    if (resultData[i] > maxV) maxV = resultData[i];
  }
  logDebug('[SAM Worker] Mask stats (first 100): min=', minV, 'max=', maxV);

  return { data: resultData, width: resultWidth, height: resultHeight };
}

// ─── Mask Upsampling ─────────────────────────────────────────────────────────

/**
 * Nearest-neighbor upsample a mask from lowRes to targetRes.
 * This is a simple utility in case the model outputs 256×256 masks.
 */
function upsampleMask(
  data: Float32Array,
  lowRes: number,
  targetRes: number
): Float32Array {
  // Assume input shape [1, 1, lowRes, lowRes]
  // We extract the first channel
  const src = data.subarray(0, lowRes * lowRes);
  const result = new Float32Array(targetRes * targetRes);

  const ratio = lowRes / targetRes;

  for (let y = 0; y < targetRes; y++) {
    const srcY = Math.min(lowRes - 1, Math.round(y * ratio));
    for (let x = 0; x < targetRes; x++) {
      const srcX = Math.min(lowRes - 1, Math.round(x * ratio));
      result[y * targetRes + x] = src[srcY * lowRes + srcX];
    }
  }

  return result;
}

// ─── ImageData → Float32Array (for OffscreenCanvas path) ─────────────────────

/**
 * Convert ImageData to a raw RGBA Float32Array.
 * This is a no-op conversion from Uint8ClampedArray to Float32Array,
 * used when the UI thread sends ImageData to the worker.
 */
function imageDataToFloat32Rgba(imageData: ImageData): Float32Array {
  const len = imageData.data.length;
  const result = new Float32Array(len);
  for (let i = 0; i < len; i++) {
    result[i] = imageData.data[i];
  }
  return result;
}

// ─── Message Handler ─────────────────────────────────────────────────────────

self.onmessage = async (e: MessageEvent<WorkerMessage>) => {
  const { type, data } = e.data;

  try {
    switch (type) {
      // ── INIT MODELS ──────────────────────────────────────────────────────
      case 'INIT_MODELS': {
        const encoderPath = data.encoderPath as string;
        const decoderPath = data.decoderPath as string;

        if (!encoderPath || !decoderPath) {
          self.postMessage({
            type: 'ERROR',
            data: { message: 'INIT_MODELS: encoderPath and decoderPath are required.' },
          });
          return;
        }

        await initModels(encoderPath, decoderPath);

        self.postMessage({ type: 'MODELS_READY' });
        break;
      }

      // ── COMPUTE EMBEDDING ───────────────────────────────────────────────
      case 'COMPUTE_EMBEDDING': {
        if (!encoderSession) {
          self.postMessage({
            type: 'ERROR',
            data: { message: 'COMPUTE_EMBEDDING: Encoder not initialized. Send INIT_MODELS first.' },
          });
          return;
        }

        const imageData = data.imageData as ImageData;
        const originalWidth = data.originalWidth as number;
        const originalHeight = data.originalHeight as number;
        const outputDims = data.outputDims as {
          padX: number;
          padY: number;
          scaledW: number;
          scaledH: number;
        };

        if (!imageData || !originalWidth || !originalHeight || !outputDims) {
          self.postMessage({
            type: 'ERROR',
            data: { message: 'COMPUTE_EMBEDDING: imageData, originalWidth, originalHeight, and outputDims are required.' },
          });
          return;
        }

        // Store original image dimensions for later mask generation
        currentImageDims = { w: originalWidth, h: originalHeight };

        // Preprocess: scale + pad + normalize
        const startTime = performance.now();
        logDebug('[SAM Worker] Preprocessing image...');
        const preprocessed = preprocessImage(
          imageData,
          originalWidth,
          originalHeight,
          outputDims
        );
        logDebug(
          '[SAM Worker] Preprocessing done in',
          Math.round(performance.now() - startTime),
          'ms'
        );

        // Run encoder
        logDebug('[SAM Worker] Running encoder...');
        const encoderStart = performance.now();
        const embeddingData = await computeEmbedding(preprocessed);
        logDebug(
          '[SAM Worker] Encoder done in',
          Math.round(performance.now() - encoderStart),
          'ms',
          '— embedding size:',
          embeddingData.length,
          'elements'
        );

        // Keep a copy of the embedding in worker memory
        currentEmbedding = new ort.Tensor('float32', embeddingData, [1, 256, 64, 64]);

        // Create a Transferable copy for the UI thread
        const transferBuffer = embeddingData.buffer.slice(0) as ArrayBuffer;

        self.postMessage(
          {
            type: 'EMBEDDING_COMPUTED',
            data: {
              embedding: transferBuffer,
              dims: [1, 256, 64, 64],
            },
          },
          { transfer: [transferBuffer] }
        );
        break;
      }

      // ── LOAD EMBEDDING ──────────────────────────────────────────────────
      case 'LOAD_EMBEDDING': {
        const embedding = data.embedding as ArrayBuffer;
        const dims = data.dims as number[];

        if (!embedding) {
          self.postMessage({
            type: 'ERROR',
            data: { message: 'LOAD_EMBEDDING: embedding ArrayBuffer is required.' },
          });
          return;
        }

        // Create a Float32Array view over the buffer
        const floatArray = new Float32Array(embedding);
        currentEmbedding = new ort.Tensor('float32', floatArray, dims || [1, 256, 64, 64]);

        // Also store image dims if provided
        if (data.originalWidth && data.originalHeight) {
          currentImageDims = {
            w: data.originalWidth as number,
            h: data.originalHeight as number,
          };
        }

        self.postMessage({ type: 'EMBEDDING_LOADED' });
        break;
      }

      // ── GENERATE MASK ───────────────────────────────────────────────────
      case 'GENERATE_MASK': {
        if (!decoderSession) {
          self.postMessage({
            type: 'ERROR',
            data: { message: 'GENERATE_MASK: Decoder not initialized. Send INIT_MODELS first.' },
          });
          return;
        }
        if (!currentEmbedding) {
          self.postMessage({
            type: 'ERROR',
            data: { message: 'GENERATE_MASK: No embedding loaded. Send COMPUTE_EMBEDDING or LOAD_EMBEDDING first.' },
          });
          return;
        }

        const prompts = data.prompts as PromptMessage[];
        const originalWidth = (data.originalWidth as number) || currentImageDims?.w || 1024;
        const originalHeight = (data.originalHeight as number) || currentImageDims?.h || 1024;

        if (!prompts || prompts.length === 0) {
          self.postMessage({
            type: 'ERROR',
            data: { message: 'GENERATE_MASK: At least one prompt is required.' },
          });
          return;
        }

        logDebug('[SAM Worker] Generating mask with', prompts.length, 'prompts...');
        const decodeStart = performance.now();

        const { data: maskData, width: maskW, height: maskH } = await generateMask(prompts, originalWidth, originalHeight);

        logDebug(
          '[SAM Worker] Mask generated in',
          Math.round(performance.now() - decodeStart),
          'ms',
          '- size:',
          maskW,
          'x',
          maskH
        );

        // Create a Transferable copy
        const maskBuffer = maskData.buffer.slice(0) as ArrayBuffer;

        self.postMessage(
          {
            type: 'MASK_GENERATED',
            data: {
              mask: maskBuffer,
              width: maskW,
              height: maskH,
              originalWidth,
              originalHeight,
            },
          },
          { transfer: [maskBuffer] }
        );
        break;
      }

      default:
        self.postMessage({
          type: 'ERROR',
          data: { message: `Unknown message type: ${type as string}` },
        });
    }
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    logDebug('[SAM Worker] Error:', errorMessage);
    self.postMessage({
      type: 'ERROR',
      data: { message: errorMessage },
    });
  }
};

// ─── Graceful Shutdown Handler ──────────────────────────────────────────────

self.addEventListener('beforeunload', () => {
  // Clean up ONNX sessions
  if (encoderSession) {
    encoderSession = null;
  }
  if (decoderSession) {
    decoderSession = null;
  }
  currentEmbedding = null;
  currentImageDims = null;
  isInitialized = false;
});
