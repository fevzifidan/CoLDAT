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
//
// Multiple CDN fallbacks to avoid single point of failure
const WASM_CDN_URLS = [
  'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.26.0/dist/',
  'https://unpkg.com/onnxruntime-web@1.26.0/dist/',
];

ort.env.wasm.wasmPaths = WASM_CDN_URLS[0];

// Configure threading (use 4 threads for reasonable performance)
// Too many threads can cause memory pressure on WASM
try {
  ort.env.wasm.numThreads = 4;
} catch (e) {
  logDebug('[SAM Worker] Multi-threading not available');
}

// Try to enable SIMD if supported, but don't fail if not available
try {
  ort.env.wasm.simd = true;
} catch (e) {
  logDebug('[SAM Worker] SIMD not available, falling back to scalar operations');
}

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
 * Use only 'wasm' — webgpu and webgl are not available in most browsers
 * and their absence causes ONNX Runtime to waste time trying to load them.
 */
const EXECUTION_PROVIDERS: ort.InferenceSession.ExecutionProviderName[] = [
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
    enableMemPattern: false,
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
    enableMemPattern: false,
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

  const encStart = performance.now();
  const results = await encoderSession.run(feeds);
  logDebug('[SAM Worker] Encoder run completed in', Math.round(performance.now() - encStart), 'ms');

  // Get the output — typically the first (and only) output
  const outputNames = encoderSession.outputNames;
  if (outputNames.length === 0) {
    throw new Error('[SAM Worker] Encoder session has no output names.');
  }

  const outputTensor = results[outputNames[0]];
  let embeddingData: Float32Array;
  
  if (outputTensor.type === 'float32') {
    embeddingData = outputTensor.data as Float32Array;
  } else if (outputTensor.type === 'float64') {
    embeddingData = new Float32Array(outputTensor.data as Float64Array);
  } else {
    embeddingData = new Float32Array(outputTensor.data as any);
  }

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
  logDebug('[SAM Worker] generateMask called. decoderSession=', !!decoderSession, 'currentEmbedding=', !!currentEmbedding, 'prompts=', prompts.length);

  // Check both prerequisites immediately - no polling (MODELS_READY event handles init order)
  if (!decoderSession) {
    throw new Error('[SAM Worker] Decoder session not initialized. Send INIT_MODELS first.');
  }
  if (!currentEmbedding) {
    throw new Error('[SAM Worker] No embedding loaded. Send COMPUTE_EMBEDDING or LOAD_EMBEDDING first.');
  }

  // CRITICAL: Validate decoder session is usable
  try {
    const inputNames = decoderSession.inputNames;
    if (!inputNames || inputNames.length === 0) {
      throw new Error('Decoder session has no input names - session may be corrupted');
    }
    logDebug('[SAM Worker] Decoder session validated. Input count:', inputNames.length);
  } catch (sessErr) {
    const errMsg = sessErr instanceof Error ? sessErr.message : String(sessErr);
    throw new Error(`[SAM Worker] Decoder session validation failed: ${errMsg}`);
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
  // CRITICAL: orig_im_size MUST be the actual original image dimensions [H, W]
  // NOT a fixed value. The decoder uses this to properly scale/align the output.
  // Passing wrong dimensions causes the decoder to hang or produce invalid results.
  const origImSizeData = new Float32Array([originalHeight, originalWidth]);
  const origImSizeTensor = new ort.Tensor('float32', origImSizeData, [2]);

  // ── Prepare feeds ───────────────────────────────────────────────────────
  const inputNames = decoderSession.inputNames;
  logDebug('[SAM Worker DEBUG] Decoder input names:', inputNames);
  logDebug('[SAM Worker] Decoder input names:', inputNames);
  logDebug('[SAM Worker] Current embedding dims:', currentEmbedding?.dims);
  logDebug('[SAM Worker] Point coords tensor dims:', pointCoordsTensor.dims);
  logDebug('[SAM Worker] Point labels tensor dims:', pointLabelsTensor.dims);

  // Build feeds by matching input names (model-dependent naming)
  const feeds: Record<string, ort.Tensor> = {};

  // We match expected names against the model's actual input names
  // Common SAM decoder input names:
  //   'image_embeddings', 'point_coords', 'point_labels',
  //   'mask_input', 'has_mask_input', 'orig_im_size'
  for (const name of inputNames) {
    const nameLower = name.toLowerCase();
    if (nameLower.includes('image') || nameLower.includes('embedding')) {
      logDebug('[SAM Worker] Matching', name, '→ image_embeddings');
      feeds[name] = currentEmbedding!;
    } else if (nameLower.includes('point_coords') || nameLower.includes('pointcoords')) {
      logDebug('[SAM Worker] Matching', name, '→ point_coords [1,', numPoints, ',2]');
      feeds[name] = pointCoordsTensor;
    } else if (nameLower.includes('point_labels') || nameLower.includes('pointlabels')) {
      logDebug('[SAM Worker] Matching', name, '→ point_labels [1,', numPoints, ']');
      feeds[name] = pointLabelsTensor;
    } else if (nameLower.includes('has_mask_input') || nameLower.includes('hasmaskinput')) {
      // IMPORTANT: Check has_mask_input BEFORE mask_input to avoid false match!
      logDebug('[SAM Worker] Matching', name, '→ has_mask_input');
      feeds[name] = hasMaskInputTensor;
    } else if (nameLower.includes('mask_input') || nameLower.includes('maskinput')) {
      logDebug('[SAM Worker] Matching', name, '→ mask_input [1,1,256,256]');
      feeds[name] = maskInputTensor;
    } else if (nameLower.includes('orig_im_size') || nameLower.includes('origimsize')) {
      logDebug('[SAM Worker] Matching', name, '→ orig_im_size [', originalHeight, ',', originalWidth, ']');
      feeds[name] = origImSizeTensor;
    }
  }

  // If matching failed, log an error
  if (Object.keys(feeds).length === 0) {
    throw new Error(
      `[SAM Worker] Could not match decoder input names. Available: [${inputNames.join(', ')}]`
    );
  }

  // Validate all feeds are valid tensors
  for (const [name, tensor] of Object.entries(feeds)) {
    if (!tensor) {
      throw new Error(`[SAM Worker] Feed tensor "${name}" is null or undefined`);
    }
    logDebug('[SAM Worker] Feed', name, 'dims:', tensor.dims, 'type:', tensor.type);
  }

  logDebug('[SAM Worker] Decoder feeds prepared. Matched:', Object.keys(feeds).length, '/', inputNames.length);

  // ── Run decoder ─────────────────────────────────────────────────────────
  logDebug('[SAM Worker] Running decoder session.run()...', 'with feeds:', Object.keys(feeds).length, 'inputs');
  const runStart = performance.now();
  let results: Record<string, ort.Tensor>;
  try {
    // Add timeout wrapper to prevent decoder.run() from hanging forever
    const decoderPromise = decoderSession.run(feeds);
    const timeoutPromise = new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error('[SAM Worker] Decoder.run() exceeded 15s timeout')), 15000)
    );
    results = await Promise.race([decoderPromise, timeoutPromise]);
  } catch (runErr) {
    const errMsg = runErr instanceof Error ? runErr.message : String(runErr);
    logDebug('[SAM Worker] Decoder run failed:', errMsg);
    throw new Error(`[SAM Worker] Decoder inference failed: ${errMsg}`);
  }
  logDebug('[SAM Worker] decoder session.run() completed in', Math.round(performance.now() - runStart), 'ms');

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
  
  if (!outputTensor) {
    throw new Error(
      `[SAM Worker] Mask output "${maskOutputName}" not found in decoder results. Available: [${outputNames.join(', ')}]`
    );
  }
  
  // Log ALL outputs for debugging purposes
  for (const name of outputNames) {
    const t = results[name];
    if (!t) {
      logDebug('[SAM Worker] Output', name, 'is null/undefined in results!');
      continue;
    }
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
    logDebug('[SAM Worker] Converting Float64 output to Float32');
    outputData = new Float32Array(float64);
  } else {
    // Try direct cast
    logDebug('[SAM Worker] Attempting direct cast to Float32Array from type:', outputTensor.type);
    outputData = new Float32Array(rawData);
  }

  if (!outputData || outputData.length === 0) {
    throw new Error(`[SAM Worker] Output tensor data is empty or null. Length: ${outputData?.length ?? 'null'}`);
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
  logDebug('[SAM Worker] onmessage:', type, 'decoderReady:', !!decoderSession);

  try {
    logDebug('[SAM Worker] === BEFORE SWITCH ===  type=' + type);
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

        // Keep a copy of the embedding in worker memory (creates a new Tensor with a copy)
        // CRITICAL: Must use a SEPARATE INDEPENDENT buffer for the copy!
        // embeddingData.buffer.slice(0) creates a transfer-safe copy, then we copy the data.
        const embeddingCopy = new Float32Array(embeddingData);
        currentEmbedding = new ort.Tensor('float32', embeddingCopy, [1, 256, 64, 64]);

        // Create a SEPARATE Transferable copy for the UI thread
        // This ensures the worker's copy remains valid after transfer
        const transferBuffer = embeddingData.buffer.slice(0) as ArrayBuffer;

        logDebug(
          '[SAM Worker] Embedding stored in worker (separate buffer). Copy size:',
          embeddingCopy.byteLength,
          'bytes. Transfer buffer:',
          transferBuffer.byteLength,
          'bytes'
        );

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

        try {
          // Create a SAFE COPY of the buffer data to avoid ownership issues
          // The transferred ArrayBuffer may be garbage-collected, so we must copy the data
          if (embedding.byteLength === 0) {
            throw new Error('LOAD_EMBEDDING: Embedding buffer is empty');
          }
          
          const floatArray = new Float32Array(embedding);
          logDebug('[SAM Worker] LOAD_EMBEDDING received. Buffer size:', embedding.byteLength, 'bytes. Float32 elements:', floatArray.length);
          
          // Create a new independent buffer (allocate + copy, not view)
          const embeddingCopy = new Float32Array(floatArray.length);
          embeddingCopy.set(floatArray); // Explicit data copy
          
          currentEmbedding = new ort.Tensor('float32', embeddingCopy, dims || [1, 256, 64, 64]);
          logDebug('[SAM Worker] Embedding tensor created with dims:', dims);

          // Also store image dims if provided
          if (data.originalWidth && data.originalHeight) {
            currentImageDims = {
              w: data.originalWidth as number,
              h: data.originalHeight as number,
            };
          }

          logDebug('[SAM Worker] Embedding loaded successfully, dims:', dims, 'copy size:', embeddingCopy.byteLength, 'bytes');
          self.postMessage({ type: 'EMBEDDING_LOADED' });
        } catch (tensorErr) {
          const errMsg = tensorErr instanceof Error ? tensorErr.message : String(tensorErr);
          logDebug('[SAM Worker] Failed to create Tensor from embedding:', errMsg);
          
          self.postMessage({
            type: 'ERROR',
            data: { message: `LOAD_EMBEDDING: Failed to create ONNX Tensor: ${errMsg}` },
          });
        }
        break;
      }

            // ── GENERATE MASK ───────────────────────────────────────────────────
      case 'GENERATE_MASK': {
        logDebug('[SAM Worker] GENERATE_MASK case reached!');
        
        try {
          const prompts = data.prompts as PromptMessage[];
          const originalWidth = (data.originalWidth as number) || currentImageDims?.w || 1024;
          const originalHeight = (data.originalHeight as number) || currentImageDims?.h || 1024;

          logDebug('[SAM Worker] GENERATE_MASK params: prompts.length=', prompts.length, 'origW=', originalWidth, 'origH=', originalHeight);

          if (!prompts || prompts.length === 0) {
            self.postMessage({
              type: 'ERROR',
              data: { message: 'GENERATE_MASK: At least one prompt is required.' },
            });
            return;
          }

          logDebug('[SAM Worker] Calling generateMask() ...');
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
        } catch (caseErr) {
          const errMsg = caseErr instanceof Error ? caseErr.message : String(caseErr);
          logDebug('[SAM Worker] GENERATE_MASK case ERROR:', errMsg);
          self.postMessage({
            type: 'ERROR',
            data: { message: `GENERATE_MASK error: ${errMsg}` },
          });
        }
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
    const stack = err instanceof Error ? err.stack : '';
    logDebug('[SAM Worker] EXCEPTION caught:', errorMessage, stack);
    self.postMessage({
      type: 'ERROR',
      data: { message: errorMessage },
    });
  }
};

// ─── Graceful Shutdown Handler ──────────────────────────────────────────────

// Global error handler for unhandled exceptions in the worker
self.onerror = (event: ErrorEvent) => {
  logDebug('[SAM Worker] GLOBAL ERROR:', event.message, event.filename, event.lineno);
  self.postMessage({
    type: 'ERROR',
    data: { message: `Global error: ${event.message}` },
  });
  return true; // Prevent default error handling
};

// Handle unhandled promise rejections
self.onrejectionhandled = (event: PromiseRejectionEvent) => {
  logDebug('[SAM Worker] Unhandled rejection:', event.reason);
};

self.onunhandledrejection = (event: PromiseRejectionEvent) => {
  logDebug('[SAM Worker] Unhandled rejection (will terminate):', event.reason);
  const errMsg = event.reason instanceof Error ? event.reason.message : String(event.reason);
  self.postMessage({
    type: 'ERROR',
    data: { message: `Unhandled rejection: ${errMsg}` },
  });
};

logDebug('[SAM Worker] Global error handlers installed');

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
