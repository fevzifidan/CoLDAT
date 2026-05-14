/**
 * useSamOrchestrator.ts
 *
 * Hybrid Flow Orchestrator for MobileSAM.
 *
 * ─── Lifecycle ──────────────────────────────────────────────────────────────
 * When a new image is loaded, this hook orchestrates the entire embedding
 * readiness pipeline:
 *
 *   [Image Mounted]
 *        │
 *        ▼
 *   [status: 'checking_cache']
 *        │
 *        ├── Cache Hit (localForage) ──► [LOAD_EMBEDDING → Worker] ──► [status: 'ready']
 *        │
 *        └── Cache Miss
 *              │
 *              ▼
 *         [status: 'checking_backend']
 *              │
 *              ├── embedding_status === 'UPLOADED' && sam_embedding_url exists
 *              │     │
 *              │     ▼
 *              │  [status: 'downloading_embedding']
 *              │     │── Fetch from S3 URL with progress tracking
 *              │     │── Save to localForage cache
 *              │     │── LOAD_EMBEDDING → Worker
 *              │     └── [status: 'ready']
 *              │
 *              └── embedding_status is NOT 'UPLOADED'
 *                    │
 *                    ▼
 *                 [status: 'computing_local']
 *                    │── Draw image to OffscreenCanvas → ImageData
 *                    │── COMPUTE_EMBEDDING → Worker
 *                    │── Save returned embedding to localForage
 *                    │── Upload to S3 (fire-and-forget via uploadService)
 *                    └── [status: 'ready']
 *
 * ─── Prompt → Mask Flow ───────────────────────────────────────────────────
 * After the embedding is ready, the user can add prompts. Each prompt addition
 * triggers a mask generation cycle:
 *
 *   addSamPrompt(x, y, type)       // store in image coordinates
 *        │
 *        ▼
 *   mapClickToModel(...)            // convert to 1024×1024 model coords
 *        │
 *        ▼
 *   GENERATE_MASK → Worker          // run decoder
 *        │
 *        ▼
 *   MASK_GENERATED ← Worker         // raw Float32Array mask
 *        │
 *        ▼
 *   cropAndScaleMask(...)           // remove padding, scale to original res
 *        │
 *        ▼
 *   convert to Blob → Object URL    // renderable mask
 *        │
 *        ▼
 *   setSamMaskBlobUrl               // display via SamCanvas
 *
 * ─── Cleanup ───────────────────────────────────────────────────────────────
 * When the image changes or the component unmounts:
 *   - Terminates the worker (new worker is created for next image)
 *   - Clears the SAM store state
 *   - Revokes any object URLs
 *   - Cancels any in-flight operations via AbortController
 *
 * ─── Usage ─────────────────────────────────────────────────────────────────
 *   const {
 *     status,
 *     isReady,
 *     generateMask,
 *     resetSession
 *   } = useSamOrchestrator(imageId, taskImage, datasetId);
 */

import { useEffect, useRef, useCallback } from 'react';
import { useAppStore } from '@/store/hooks/useAppStore';
import { getEmbedding, saveEmbedding } from './embeddingCache';
import { mapClickToModel, cropAndScaleMask, getScaledDims, SAM_TENSOR_SIZE } from './samCoords';
import type { TaskImage, SAMStatus, SAMPrompt } from '../../types/annotation.types';
import { uploadService } from '@/shared/services/s3upload/s3upload.service';
import notificationService from '@/shared/services/notification';

// ─── Constants ───────────────────────────────────────────────────────────────

/** Paths to the ONNX model files hosted as static assets in public/models/ */
const ENCODER_MODEL_PATH = '/models/mobilesam_encoder.onnx';
const DECODER_MODEL_PATH = '/models/mobilesam_decoder.onnx';

/** Default mask opacity for the overlay */
const DEFAULT_MASK_OPACITY = 0.6;

/** Download chunk size for S3 streaming (256KB) */
const DOWNLOAD_CHUNK_SIZE = 256 * 1024;

// ─── Types ───────────────────────────────────────────────────────────────────

interface OrchestratorState {
  status: SAMStatus;
  isReady: boolean;
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useSamOrchestrator(
  imageId: string,
  taskImage: TaskImage | null,
  datasetId: string
): {
  status: SAMStatus;
  isReady: boolean;
  generateMask: (prompts: SAMPrompt[]) => Promise<void>;
  resetSession: () => void;
} {
  // ─── Store Accessors ──────────────────────────────────────────────────────
  const setSamStatus = useAppStore((s) => s.setSamStatus);
  const setSamDownloadProgress = useAppStore((s) => s.setSamDownloadProgress);
  const setSamEmbeddingReady = useAppStore((s) => s.setSamEmbeddingReady);
  const setSamMaskBlobUrl = useAppStore((s) => s.setSamMaskBlobUrl);
  const setSamMaskData = useAppStore((s) => s.setSamMaskData);
  const clearSamMask = useAppStore((s) => s.clearSamMask);
  const clearSamPrompts = useAppStore((s) => s.clearSamPrompts);
  const resetSamState = useAppStore((s) => s.resetSamState);
  const samStatus = useAppStore((s) => s.samStatus);
  const imgDimensions = useAppStore((s) => s.imgDimensions);

  // ─── Refs (persist across renders without causing re-renders) ────────────
  const workerRef = useRef<Worker | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isInitializedRef = useRef(false);
  const imageIdRef = useRef(imageId);

  // Track whether the component is still mounted to avoid state updates after unmount
  const isMountedRef = useRef(true);

  // ─── Initialize Embedding ─────────────────────────────────────────────────

  const initializeEmbedding = useCallback(async () => {
    if (!imageId || !taskImage) return;

    // Cancel any previous in-flight operations
    abortControllerRef.current?.abort();
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    // Reset the store for the new image
    resetSamState();
    clearSamPrompts();

    const origW = imgDimensions?.width ?? 1024;
    const origH = imgDimensions?.height ?? 1024;

    try {
      // ── Step 1: Check localForage cache ─────────────────────────────────
      if (!abortController.signal.aborted) {
        setSamStatus('checking_cache');
      }

      const cachedEmbedding = await getEmbedding(imageId);

      if (cachedEmbedding && !abortController.signal.aborted) {
        console.info('[SAM Orchestrator] Cache HIT for', imageId);
        // Found in cache — load into worker
        if (workerRef.current) {
          workerRef.current.postMessage(
            {
              type: 'LOAD_EMBEDDING',
              data: {
                embedding: cachedEmbedding,
                dims: [1, 256, 64, 64],
                originalWidth: origW,
                originalHeight: origH,
              },
            },
            { transfer: [cachedEmbedding] }
          );

          // Wait for confirmation
          const ready = await waitForWorkerResponse(workerRef.current, 'EMBEDDING_LOADED', abortController.signal);
          if (ready && !abortController.signal.aborted) {
            setSamEmbeddingReady(true);
            setSamStatus('ready');
            return;
          }
        }
      }

      if (abortController.signal.aborted) return;

      // ── Step 2: Check backend for precomputed embedding ─────────────────
      setSamStatus('checking_backend');

      const hasPrecomputedEmbedding =
        taskImage.embedding_status === 'UPLOADED' &&
        taskImage.sam_embedding_url !== null &&
        taskImage.sam_embedding_url !== undefined;

      if (hasPrecomputedEmbedding) {
        // ── Step 2a: Download embedding from S3 ──────────────────────────
        console.info('[SAM Orchestrator] Downloading precomputed embedding from S3:', imageId);
        setSamStatus('downloading_embedding');
        setSamDownloadProgress(0);

        try {
          const downloadedBuffer = await fetchEmbeddingWithProgress(
            taskImage.sam_embedding_url!,
            (progress) => {
              if (!abortController.signal.aborted) {
                setSamDownloadProgress(progress);
              }
            },
            abortController.signal
          );

          if (abortController.signal.aborted) return;

          // Cache it locally
          await saveEmbedding(imageId, downloadedBuffer);

          // Load into worker
          if (workerRef.current) {
            workerRef.current.postMessage(
              {
                type: 'LOAD_EMBEDDING',
                data: {
                  embedding: downloadedBuffer,
                  dims: [1, 256, 64, 64],
                  originalWidth: origW,
                  originalHeight: origH,
                },
              },
              { transfer: [downloadedBuffer] }
            );

            const ready = await waitForWorkerResponse(workerRef.current, 'EMBEDDING_LOADED', abortController.signal);
            if (ready && !abortController.signal.aborted) {
              setSamEmbeddingReady(true);
              setSamStatus('ready');
              return;
            }
          }
        } catch (err) {
          // S3 download failed — fall through to local computation
          console.warn('[SAM Orchestrator] S3 download failed, falling back to local computation:', err);
        }
      }

      if (abortController.signal.aborted) return;

      // ── Step 3: Compute embedding locally ──────────────────────────────
      console.info('[SAM Orchestrator] Computing embedding locally for', imageId);
      setSamStatus('computing_local');
      setSamDownloadProgress(0);

      // Draw the image to an OffscreenCanvas to get raw pixel data
      const imageData = await loadImageToImageData(taskImage.asset_url, origW, origH, abortController.signal);
      if (abortController.signal.aborted || !imageData) return;

      const dims = getScaledDims(origW, origH, SAM_TENSOR_SIZE);
      const outputDims = {
        padX: dims.padX,
        padY: dims.padY,
        scaledW: dims.width,
        scaledH: dims.height,
      };

      // Compute the embedding in the worker
      const embeddingBuffer = await computeEmbeddingInWorker(
        
        workerRef.current!,
        imageData,
        origW,
        origH,
        outputDims,
        abortController.signal
      );

      if (abortController.signal.aborted || !embeddingBuffer) return;

      // Cache the computed embedding
      await saveEmbedding(imageId, embeddingBuffer);

      if (abortController.signal.aborted) return;

      // Fire-and-forget: Upload the computed embedding to S3
      uploadEmbeddingToS3(embeddingBuffer, imageId, datasetId, origW, origH);

      setSamEmbeddingReady(true);
      setSamStatus('ready');
    } catch (err) {
      if (!abortController.signal.aborted) {
        console.error('[SAM Orchestrator] Initialization failed:', err);
        notificationService.error('SAM initialization failed. Please try again.');
        setSamStatus('idle');
      }
    }
  }, [imageId, taskImage, datasetId, imgDimensions, setSamStatus, setSamDownloadProgress, setSamEmbeddingReady, resetSamState, clearSamPrompts]);

  // ─── Worker Bootstrap ────────────────────────────────────────────────────

  const bootstrapWorker = useCallback(async (): Promise<Worker> => {
    // Terminate any existing worker
    workerRef.current?.terminate();

    // Create a new worker
    const worker = new Worker(new URL('./samWorker', import.meta.url), { type: 'module' });
    workerRef.current = worker;

    // Log worker LOG messages to console
    worker.addEventListener('message', (e: MessageEvent) => {
      const msg = e.data;
      if (msg.type === 'LOG') {
        console.log('[SAM Worker Log]', ...(msg.data?.args ?? []));
      }
    });

    // Set up the error handler
    worker.onerror = (err) => {
      console.error('[SAM Worker] Unhandled error:', err);
      notificationService.error('SAM worker encountered an error.');
      setSamStatus('idle');
    };

    // Initialize models
    worker.postMessage({
      type: 'INIT_MODELS',
      data: {
        encoderPath: ENCODER_MODEL_PATH,
        decoderPath: DECODER_MODEL_PATH,
      },
    });

    // Wait for the worker to confirm models are ready
    await new Promise<void>((resolve, reject) => {
      // Büyük ONNX modellerinin (encoder ~28MB, decoder ~16MB) indirilmesi zaman alır
      const timeout = setTimeout(() => {
        reject(new Error('Worker model initialization timed out (180s)'));
      }, 180_000);

      const handler = (e: MessageEvent) => {
        const msg = e.data;
        if (msg.type === 'MODELS_READY') {
          clearTimeout(timeout);
          worker.removeEventListener('message', handler);
          resolve();
        } else if (msg.type === 'ERROR') {
          clearTimeout(timeout);
          worker.removeEventListener('message', handler);
          reject(new Error(msg.data?.message ?? 'Worker initialization error'));
        }
      };

      worker.addEventListener('message', handler);
    });

    return worker;
  }, [setSamStatus]);

  // ─── Lifecycle: Mount + Image Changes ─────────────────────────────────────

  useEffect(() => {
    isMountedRef.current = true;
    imageIdRef.current = imageId;

    let isCancelled = false;

    const start = async () => {
      try {
        // Bootstrap the worker
        const worker = await bootstrapWorker();
        if (isCancelled || !isMountedRef.current) {
          worker.terminate();
          return;
        }

        // Initialize the embedding pipeline
        await initializeEmbedding();
      } catch (err) {
        if (!isCancelled) {
          console.error('[SAM Orchestrator] Failed to bootstrap:', err);
          notificationService.error('SAM models failed to load.');
          setSamStatus('idle');
        }
      }
    };

    start();

    return () => {
      isCancelled = true;
      isMountedRef.current = false;

      // Cleanup
      abortControllerRef.current?.abort();
      workerRef.current?.terminate();
      workerRef.current = null;
      isInitializedRef.current = false;
      resetSamState();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageId]);

  // ─── Generate Mask (called after prompts change) ─────────────────────────

  const generateMask = useCallback(
    async (prompts: SAMPrompt[]): Promise<void> => {
      if (!workerRef.current || prompts.length === 0) {
        clearSamMask();
        return;
      }

      const origW = imgDimensions?.width ?? 1024;
      const origH = imgDimensions?.height ?? 1024;

      try {
        // Convert prompts from image coordinates to model (1024×1024) coordinates
        const modelPrompts = prompts
          .map((p) => {
            const coords = mapClickToModel(p.x, p.y, origW, origH, SAM_TENSOR_SIZE);
            if (!coords) return null;
            return {
              x: coords.x,
              y: coords.y,
              type: p.type,
            };
          })
          .filter((p): p is { x: number; y: number; type: 'positive' | 'negative' } => p !== null);

        if (modelPrompts.length === 0) {
          clearSamMask();
          return;
        }

        // Send GENERATE_MASK to worker
        const maskResult = await new Promise<{ mask: ArrayBuffer; width: number; height: number }>((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('Mask generation timed out (15s)'));
          }, 15_000);

          const handler = (e: MessageEvent) => {
            const msg = e.data;
            if (msg.type === 'MASK_GENERATED') {
              clearTimeout(timeout);
              workerRef.current?.removeEventListener('message', handler);
              resolve({
                mask: msg.data.mask as ArrayBuffer,
                width: msg.data.width as number,
                height: msg.data.height as number,
              });
            } else if (msg.type === 'ERROR') {
              clearTimeout(timeout);
              workerRef.current?.removeEventListener('message', handler);
              reject(new Error(msg.data?.message ?? 'Mask generation error'));
            }
          };

          workerRef.current!.addEventListener('message', handler);

          workerRef.current!.postMessage({
            type: 'GENERATE_MASK',
            data: {
              prompts: modelPrompts,
              originalWidth: origW,
              originalHeight: origH,
            },
          });
        });

        console.log('[SAM Orchestrator] Mask buffer received, size:', maskResult.mask?.byteLength);
        console.log('[SAM Orchestrator] Mask metadata:', { width: maskResult.width, height: maskResult.height });

        if (!maskResult.mask || maskResult.mask.byteLength === 0) {
          clearSamMask();
          return;
        }

        // Get the mask width/height from the worker response
        const maskWidthFromWorker = maskResult.width;
        const maskHeightFromWorker = maskResult.height;
        console.log('[SAM Orchestrator] Mask resolution from worker:', maskWidthFromWorker, 'x', maskHeightFromWorker);

        // Use the actual mask dimensions from worker instead of SAM_TENSOR_SIZE
        // Model output is already at [1, 1, H, W] = [1, 1, maskHeightFromWorker, maskWidthFromWorker]
        // If the model output matches the original image dimensions, no scaling is needed
        const tensorData = new Float32Array(maskResult.mask);
        console.log('[SAM Orchestrator] Tensor data length:', tensorData.length, 'Float32 elements');
        console.log('[SAM Orchestrator] Original image dims:', origW, 'x', origH);
        
        // Check some stats
        let minV = Infinity, maxV = -Infinity;
        for (let i = 0; i < Math.min(tensorData.length, 1000); i++) {
          if (tensorData[i] < minV) minV = tensorData[i];
          if (tensorData[i] > maxV) maxV = tensorData[i];
        }
        console.log('[SAM Orchestrator] Mask tensor stats (first 1000): min=', minV, 'max=', maxV);
        
        let maskData: Uint8Array;
        let maskWidth: number;
        let maskHeight: number;
        
        // Check if model output already matches original image dimensions
        if (maskWidthFromWorker === origW && maskHeightFromWorker === origH) {
          // Model output is already at original resolution.
          // MobileSAM 'masks' output contains raw logits. Apply sigmoid then threshold at 0.5.
          // sigmoid(0) = 0.5, so 0.0 threshold on logits is equivalent.
          // For multi-point prompts, increase threshold to reduce over-segmentation.
          maskWidth = origW;
          maskHeight = origH;
          maskData = new Uint8Array(origW * origH);
          
          for (let i = 0; i < tensorData.length; i++) {
            maskData[i] = tensorData[i] > 0.0 ? 255 : 0;
          }
        } else {
          // Need to crop and scale from model output space to original image space
          const result = cropAndScaleMask(
            tensorData,
            Math.max(maskWidthFromWorker, maskHeightFromWorker), // tensorSize (max dim)
            origW,
            origH,
            Math.max(maskWidthFromWorker, maskHeightFromWorker)  // targetSize (same as tensorSize)
          );
          maskData = result.maskData;
          maskWidth = result.maskWidth;
          maskHeight = result.maskHeight;
        }

        console.log('[SAM Orchestrator] Mask data stats:', { 
          maskWidth, 
          maskHeight, 
          maskDataLength: maskData.length,
          nonZeroCount: maskData.reduce((sum, v) => sum + (v > 0 ? 1 : 0), 0)
        });

        // Convert the mask to a renderable PNG blob
        const maskBlobUrl = await maskToBlobUrl(maskData, maskWidth, maskHeight);

        if (isMountedRef.current && imageIdRef.current === imageId) {
          // Revoke previous mask URL
          clearSamMask();
          // Store raw mask data for polygon conversion
          setSamMaskData({ maskData, width: maskWidth, height: maskHeight });
          setSamMaskBlobUrl(maskBlobUrl);
          console.log('[SAM Orchestrator] Mask blob URL set');
        }
      } catch (err) {
        console.error('[SAM Orchestrator] Mask generation failed:', err);
        clearSamMask();
      }
    },
    [imgDimensions, clearSamMask, setSamMaskBlobUrl, imageId]
  );

  // ─── Reset Session ────────────────────────────────────────────────────────

  const resetSession = useCallback(() => {
    abortControllerRef.current?.abort();
    workerRef.current?.terminate();
    workerRef.current = null;
    isInitializedRef.current = false;
    resetSamState();
  }, [resetSamState]);

  // ─── Auto-Generate Mask on Prompt Changes ─────────────────────────────────
  //
  // When the embedding is ready and the user adds/removes prompts, this effect
  // automatically triggers mask generation. This eliminates the need for
  // explicit callback wiring between the interaction hook and the orchestrator.

  // ─── Subscribe to samPromptCount to auto-generate masks on prompt changes ──
  //
  // When the embedding is ready (samStatus === 'ready') and the user adds or
  // removes a prompt (samPromptCount changes), this triggers generateMask().
  //
  // We subscribe to samPromptCount (a number) instead of the full samPrompts
  // array to avoid unnecessary re-renders from array reference changes.
  const samPromptCount = useAppStore((s) => s.samPromptCount);

  useEffect(() => {
    if (samStatus !== 'ready') return;

    const prompts = useAppStore.getState().samPrompts;
    if (prompts.length === 0) {
      clearSamMask();
      return;
    }

    // Generate mask for the current prompts
    generateMask(prompts);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [samStatus, samPromptCount, generateMask, clearSamMask]);

  // ─── Return ───────────────────────────────────────────────────────────────

  return {
    status: samStatus,
    isReady: samStatus === 'ready' && useAppStore.getState().samEmbeddingReady,
    generateMask,
    resetSession,
  };
}

// ─── Helper: Wait for a specific worker response message ─────────────────────

function waitForWorkerResponse(
  worker: Worker,
  expectedType: string,
  signal: AbortSignal
): Promise<boolean> {
  return new Promise<boolean>((resolve) => {
    const timeout = setTimeout(() => {
      worker.removeEventListener('message', handler);
      resolve(false);
    }, 60_000);

    const handler = (e: MessageEvent) => {
      if (signal.aborted) {
        clearTimeout(timeout);
        worker.removeEventListener('message', handler);
        resolve(false);
        return;
      }

      const msg = e.data;
      if (msg.type === expectedType) {
        clearTimeout(timeout);
        worker.removeEventListener('message', handler);
        resolve(true);
      } else if (msg.type === 'ERROR') {
        clearTimeout(timeout);
        worker.removeEventListener('message', handler);
        console.error('[SAM Orchestrator] Worker error:', msg.data?.message);
        resolve(false);
      }
    };

    worker.addEventListener('message', handler);
  });
}

// ─── Helper: Fetch embedding from S3 with progress tracking ──────────────────

async function fetchEmbeddingWithProgress(
  url: string,
  onProgress: (progress: number) => void,
  signal: AbortSignal
): Promise<ArrayBuffer> {
  const response = await fetch(url, { signal });

  if (!response.ok) {
    throw new Error(`Failed to fetch embedding: ${response.status} ${response.statusText}`);
  }

  const contentLength = response.headers.get('content-length');
  const totalBytes = contentLength ? parseInt(contentLength, 10) : null;
  const reader = response.body?.getReader();
  if (!reader) {
    // Fallback: just read the whole response at once
    return response.arrayBuffer();
  }

  const chunks: Uint8Array[] = [];
  let receivedBytes = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    chunks.push(value);
    receivedBytes += value.byteLength;

    if (totalBytes) {
      onProgress(Math.round((receivedBytes / totalBytes) * 100));
    }
  }

  // Concatenate all chunks into a single ArrayBuffer
  const result = new Uint8Array(receivedBytes);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.byteLength;
  }

  onProgress(100);
  return result.buffer;
}

// ─── Helper: Load image URL to ImageData via OffscreenCanvas ─────────────────

async function loadImageToImageData(
  imageUrl: string,
  width: number,
  height: number,
  signal: AbortSignal
): Promise<ImageData | null> {
  return new Promise<ImageData | null>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';

    const timeout = setTimeout(() => {
      img.onload = null;
      img.onerror = null;
      reject(new Error('Image load timed out'));
    }, 30_000);

    img.onload = () => {
      clearTimeout(timeout);
      if (signal.aborted) {
        resolve(null);
        return;
      }

      try {
        const canvas = new OffscreenCanvas(img.width, img.height);
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get OffscreenCanvas 2D context'));
          return;
        }

        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, img.width, img.height);
        resolve(imageData);
      } catch (err) {
        reject(err);
      }
    };

    img.onerror = () => {
      clearTimeout(timeout);
      reject(new Error('Failed to load image'));
    };

    img.src = imageUrl;
  });
}

// ─── Helper: Compute embedding in the worker ─────────────────────────────────

async function computeEmbeddingInWorker(
  worker: Worker,
  imageData: ImageData,
  originalWidth: number,
  originalHeight: number,
  outputDims: { padX: number; padY: number; scaledW: number; scaledH: number },
  signal: AbortSignal
): Promise<ArrayBuffer | null> {
  return new Promise<ArrayBuffer | null>((resolve, reject) => {
    const timeout = setTimeout(() => {
      worker.removeEventListener('message', handler);
      reject(new Error('Embedding computation timed out (60s)'));
    }, 60_000);

    const handler = (e: MessageEvent) => {
      if (signal.aborted) {
        clearTimeout(timeout);
        worker.removeEventListener('message', handler);
        resolve(null);
        return;
      }

      const msg = e.data;
      if (msg.type === 'EMBEDDING_COMPUTED') {
        clearTimeout(timeout);
        worker.removeEventListener('message', handler);
        resolve(msg.data.embedding as ArrayBuffer);
      } else if (msg.type === 'ERROR') {
        clearTimeout(timeout);
        worker.removeEventListener('message', handler);
        reject(new Error(msg.data?.message ?? 'Embedding computation error'));
      }
    };

    worker.addEventListener('message', handler);

    // Transfer the ImageData's buffer to the worker to avoid structured cloning
    const buffer = imageData.data.buffer.slice(0);
    worker.postMessage(
      {
        type: 'COMPUTE_EMBEDDING',
        data: {
          imageData,
          originalWidth,
          originalHeight,
          outputDims,
        },
      },
      { transfer: [buffer] }
    );
  });
}

// ─── Helper: Upload computed embedding to S3 (fire-and-forget) ───────────────

async function uploadEmbeddingToS3(
  embeddingBuffer: ArrayBuffer,
  assetId: string,
  datasetId: string,
  width: number,
  height: number
): Promise<void> {
  try {
    // Create a Blob from the ArrayBuffer embedding
    const embeddingBlob = new Blob([embeddingBuffer], {
      type: 'application/octet-stream',
    });

    // Create a File-like wrapper for the S3UploadService
    const file = new File([embeddingBlob], `${assetId}_embedding.bin`, {
      type: 'application/octet-stream',
    });

    // Use the existing uploadService to handle the upload
    await uploadService.addUpload(file, datasetId, {
      upload_type: 'embedding',
      asset_id: assetId,
      hidden: true, // Don't show in the upload manager UI
      priority: 'LOW',
    });

    console.info('[SAM Orchestrator] Embedding upload queued for S3:', assetId);
  } catch (err) {
    // Fire-and-forget: log the error but don't disrupt the user
    console.warn('[SAM Orchestrator] Failed to queue embedding upload:', err);
  }
}

// ─── Helper: Convert binary mask Uint8Array to a renderable Blob URL ─────────

async function maskToBlobUrl(
  maskData: Uint8Array,
  width: number,
  height: number
): Promise<string> {
  // Create a canvas to render the mask as a colored overlay
  const canvas = new OffscreenCanvas(width, height);
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get canvas context for mask rendering');
  }

  // Create an ImageData from the mask and render it
  // We use a blue semi-transparent overlay for the mask
  const imageData = ctx.createImageData(width, height);

  for (let i = 0; i < maskData.length; i++) {
    const pixelOffset = i * 4;
    if (maskData[i] > 0) {
      // Mask pixel: semi-transparent blue
      imageData.data[pixelOffset] = 59;      // R
      imageData.data[pixelOffset + 1] = 130; // G
      imageData.data[pixelOffset + 2] = 246; // B
      imageData.data[pixelOffset + 3] = 153; // A (~60% opacity)
    } else {
      // Background: fully transparent
      imageData.data[pixelOffset] = 0;
      imageData.data[pixelOffset + 1] = 0;
      imageData.data[pixelOffset + 2] = 0;
      imageData.data[pixelOffset + 3] = 0;
    }
  }

  ctx.putImageData(imageData, 0, 0);

  // Convert to blob and create an object URL
  const blob = await canvas.convertToBlob({ type: 'image/png' });
  return URL.createObjectURL(blob);
}
