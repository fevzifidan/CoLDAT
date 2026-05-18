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
 *   } = useSamOrchestrator(imageId, taskImage, datasetId, enabled);
 */

import { useEffect, useRef, useCallback } from 'react';
import { useAppStore } from '@/store/hooks/useAppStore';
import { getEmbedding, saveEmbedding } from './embeddingCache';
import { mapClickToModel, cropAndScaleMask, getScaledDims, SAM_TENSOR_SIZE, mapBboxToModel } from './samCoords';
import type { TaskImage, SAMStatus, SAMPrompt, SAMBboxPrompt, SamLogitData } from '../../types/annotation.types';
import { uploadService } from '@/shared/services/s3upload/s3upload.service';
import notificationService from '@/shared/services/notification';

// ─── Polygon/Blob Worker (singleton for offloading heavy ops) ────────────────
// This singleton is EXPORTED so GlobalKeyboardListener can reuse the same
// instance instead of spawning its own, which caused the MASK_TO_POLYGON timeout.

let polyWorkerRef: Worker | null = null;

export function getPolygonWorker(): Worker {
  if (!polyWorkerRef) {
    polyWorkerRef = new Worker(
      new URL('./samPolygonWorker', import.meta.url),
      { type: 'module' }
    );
  }
  return polyWorkerRef;
}

/**
 * Send a request to the shared polygon worker and return a Promise.
 * Exported for use in GlobalKeyboardListener (mask → polygon on Enter).
 */
export function sendPolygonWorkerRequest(
  type: string,
  data: Record<string, unknown>
): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const worker = getPolygonWorker();
    const requestId = `${type}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

    let timeoutHandle: ReturnType<typeof setTimeout>;

    const handler = (e: MessageEvent) => {
      const msg = e.data;
      if (msg.requestId !== requestId) return;
      worker.removeEventListener('message', handler);
      clearTimeout(timeoutHandle);
      if (msg.type === 'ERROR') {
        reject(new Error((msg.data?.message as string) ?? 'Worker error'));
      } else {
        resolve(msg.data);
      }
    };

    worker.addEventListener('message', handler);

    // 30s timeout for polygon conversion
    timeoutHandle = setTimeout(() => {
      worker.removeEventListener('message', handler);
      reject(new Error(`${type} timed out after 30000ms`));
    }, 30_000);

    const maskData = data['maskData'];
    if (maskData instanceof Uint8Array && maskData.byteLength > 0) {
      const cloned = new Uint8Array(maskData);
      const messageData = { ...data, maskData: cloned };
      worker.postMessage({ type, data: messageData, requestId }, [cloned.buffer]);
    } else {
      worker.postMessage({ type, data, requestId });
    }
  });
}


/**
 * Offload CROP_SCALE_MASK operation to the polygon worker to avoid main-thread
 * blocking during heavy nearest-neighbor scaling of large tensors.
 */
function offloadCropScaleMask(
  tensorData: Float32Array,
  tensorSize: number,
  padX: number,
  padY: number,
  scaledW: number,
  scaledH: number,
  originalWidth: number,
  originalHeight: number
): Promise<{ maskData: Uint8Array; maskWidth: number; maskHeight: number }> {
  return new Promise((resolve, reject) => {
    const worker = getPolygonWorker();
    const requestId = `CROP_SCALE_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

    const handler = (e: MessageEvent) => {
      const msg = e.data;
      if (msg.requestId !== requestId) return;
      worker.removeEventListener('message', handler);

      if (msg.type === 'ERROR') {
        reject(new Error((msg.data?.message as string) ?? 'CROP_SCALE_MASK failed'));
      } else {
        const buf = msg.data.maskData as ArrayBuffer;
        resolve({
          maskData: new Uint8Array(buf),
          maskWidth: msg.data.maskWidth as number,
          maskHeight: msg.data.maskHeight as number,
        });
      }
    };

    worker.addEventListener('message', handler);

    setTimeout(() => {
      worker.removeEventListener('message', handler);
      reject(new Error('CROP_SCALE_MASK timed out (30s)'));
    }, 30_000);

    // Clone the Float32Array buffer properly respecting byteOffset & byteLength,
    // then transfer the clone for zero-copy efficiency
    const cloned = new Float32Array(tensorData);
    worker.postMessage(
      {
        type: 'CROP_SCALE_MASK',
        requestId,
        data: {
          tensorData: cloned,
          tensorSize,
          padX,
          padY,
          scaledW,
          scaledH,
          originalWidth,
          originalHeight,
        },
      },
      { transfer: [cloned.buffer] }
    );
  });
}

/**
 * Offload MASK_TO_BLOB_URL operation to the polygon worker.
 * Uses OffscreenCanvas inside the worker to render the PNG blob.
 */
function offloadMaskToBlobUrl(
  maskData: Uint8Array,
  width: number,
  height: number
): Promise<string> {
  return new Promise((resolve, reject) => {
    const worker = getPolygonWorker();
    const requestId = `BLOB_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

    const handler = (e: MessageEvent) => {
      const msg = e.data;
      if (msg.requestId !== requestId) return;
      worker.removeEventListener('message', handler);

      if (msg.type === 'ERROR') {
        reject(new Error((msg.data?.message as string) ?? 'MASK_TO_BLOB_URL failed'));
      } else {
        resolve(msg.data.blobUrl as string);
      }
    };

    worker.addEventListener('message', handler);

    setTimeout(() => {
      worker.removeEventListener('message', handler);
      reject(new Error('MASK_TO_BLOB_URL timed out (15s)'));
    }, 15_000);

    // Clone the mask buffer properly respecting byteOffset & byteLength,
    // then transfer the clone for zero-copy efficiency
    const cloned = new Uint8Array(maskData);
    worker.postMessage(
      {
        type: 'MASK_TO_BLOB_URL',
        requestId,
        data: { maskData: cloned, width, height },
      },
      { transfer: [cloned.buffer] }
    );
  });
}

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
  datasetId: string,
  enabled: boolean = true
): {
  status: SAMStatus;
  isReady: boolean;
  generateMask: (prompts: SAMPrompt[], bbox?: SAMBboxPrompt | null) => Promise<void>;
  resetSession: () => void;
} {
  // ─── Store Accessors ──────────────────────────────────────────────────────
  const setSamStatus = useAppStore((s) => s.setSamStatus);
  const setSamDownloadProgress = useAppStore((s) => s.setSamDownloadProgress);
  const setSamEmbeddingReady = useAppStore((s) => s.setSamEmbeddingReady);
  const setSamMaskBlobUrl = useAppStore((s) => s.setSamMaskBlobUrl);
  const setSamMaskData = useAppStore((s) => s.setSamMaskData);
  const setSamLogitData = useAppStore((s) => s.setSamLogitData);
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
  // Tracks whether BOTH encoder AND decoder models are fully loaded in the worker.
  // The worker sends MODELS_READY only after both sessions are created.
  // Until then, GENERATE_MASK will fail because decoderSession is null.
  // generateMask checks this ref before sending GENERATE_MASK to the worker.
  const modelsReadyRef = useRef(false);

    // Track whether the component is still mounted to avoid state updates after unmount
  const isMountedRef = useRef(true);
  // Track enabled value separately to avoid stale closure issues
  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;

  // ─── Initialize Embedding ─────────────────────────────────────────────────

    const initializeEmbedding = useCallback(async () => {
    if (!imageId || !taskImage) return;

    // ── enabled kontrolü ──────────────────────────────────────────────────
    // Eğer SAM tool'u artık aktif değilse embedding başlatma.
    // Bu, render-phase'de setActiveTool('select') çağrıldığında oluşan
    // geçici durumu (bir sonraki render'a kadar enabled=true kalması) önler.
    if (!enabledRef.current) return;

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
        // Found in cache — load into worker optimistically
        if (workerRef.current) {
          try {
            // Clone the buffer before transfer to avoid double-free issues
            const clonedBuffer = cachedEmbedding.slice(0);
            workerRef.current.postMessage(
              {
                type: 'LOAD_EMBEDDING',
                data: {
                  embedding: clonedBuffer,
                  dims: [1, 256, 64, 64],
                  originalWidth: origW,
                  originalHeight: origH,
                },
              },
              { transfer: [clonedBuffer] }
            );
          } catch (e) {
            console.warn('[SAM Orchestrator] postMessage failed, worker dead?', e);
          }
        }
        // Optimistically mark ready — if the worker fails, generateMask will error.
        setSamEmbeddingReady(true);
        setSamStatus('ready');
        console.info('[SAM Orchestrator] Cache HIT — marking ready optimistically');
        return;
      }

      if (abortController.signal.aborted) return;

      // ── Step 2 & 3 combined: Compute embedding locally if we get here
      // (cache miss OR cache hit but EMBEDDING_LOADED not confirmed).
      // Skip backend check — if cache was usable it would have worked.
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
        notificationService.error('SAM initialization failed. Please refresh the page or try again.');
        setSamStatus('idle');
      }
    }
  }, [imageId, taskImage, datasetId, imgDimensions, setSamStatus, setSamDownloadProgress, setSamEmbeddingReady, resetSamState, clearSamPrompts]);

  // ─── Worker Bootstrap ────────────────────────────────────────────────────

  const bootstrapWorker = useCallback(async (): Promise<Worker> => {
    // Set status to loading_models
    setSamStatus('loading_models');

    // Terminate any existing worker
    workerRef.current?.terminate();

    // Create a new worker
    const worker = new Worker(new URL('./samWorker', import.meta.url), { type: 'module' });
    workerRef.current = worker;

    // Log all worker messages (LOG, ERROR, etc.)
    worker.addEventListener('message', (e: MessageEvent) => {
      const msg = e.data;
      if (msg.type === 'LOG') {
        console.log('[SAM Worker Log]', ...(msg.data?.args ?? []));
      } else if (msg.type === 'ERROR') {
        console.error('[SAM Worker] Reported error:', msg.data?.message);
        // Show error to user for non-recoverable errors
        if (msg.data?.message?.includes('onnxruntime') || msg.data?.message?.includes('Tensor') || msg.data?.message?.includes('embedding')) {
          notificationService.error(`SAM: ${msg.data.message}`);
        }
      }
    });

    // Set up the error handler for unhandled worker errors
    worker.onerror = (err: ErrorEvent) => {
      console.error('[SAM Worker] Unhandled error:', err.message, '| file:', err.filename, 'line:', err.lineno, 'col:', err.colno);
      notificationService.error(`SAM worker error: ${err.message}`);
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
          modelsReadyRef.current = true;
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
  //
  // When imageId changes → full reset + bootstrapWorker.
  //
  // TaskImage metadata may arrive asynchronously after the initial mount
  // (useAnnotationData fetches taskImages). When the page first loads,
  // taskImage is null so initializeEmbedding early-returns. Once taskImage
  // becomes available, the deps on imageId + taskImage ensure this effect
  // re-fires, but WITHOUT re-bootstrapping the worker (which would re-download
  // the ONNX models and cause a "Encoder not initialized" race).

    useEffect(() => {
    isMountedRef.current = true;
    imageIdRef.current = imageId;

    // ── enabled kontrolü ──────────────────────────────────────────────────
    // SAM tool'u aktif değilse embedding pipeline'ını başlatma.
    // Worker ve önceden yüklenmiş embedding korunur, böylece kullanıcı
    // tekrar SAM'a döndüğünde süreç baştan başlamaz.
    if (!enabled) return;

    let isCancelled = false;

    const start = async () => {
      try {
        // Only bootstrap the worker (download ONNX models) when imageId changes.
        // If taskImage was previously null and is now available, worker already
        // exists and is initialized — skip bootstrap.
        if (!workerRef.current) {
          const worker = await bootstrapWorker();
          if (!isMountedRef.current) {
            worker.terminate();
            return;
          }
          if (isCancelled) return;
        }

        // Initialize the embedding pipeline.
        // If taskImage is null (metadata not yet loaded), this will early-return.
        // The effect will re-fire once taskImage becomes non-null (deps below).
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

      // Cleanup: sadece imageId değiştiğinde state ve inflight işlemleri temizle.
      // enabled değişikliklerinde (tool değişimi) worker ve embedding korunur.
      // Aynı resim üzerinde SAM ↔ diğer tool'lar arası geçişlerde
      // embedding'in tekrar hesaplanmasını önler.
      if (imageIdRef.current !== imageId) {
        abortControllerRef.current?.abort();
        // Keep the worker alive for the next image
        isInitializedRef.current = false;
        // DO NOT reset modelsReadyRef because the worker is still alive and models are loaded!
        resetSamState();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageId, taskImage, enabled]);

  // ─── Generate Mask (called after prompts change) ─────────────────────────

                const generateMask = useCallback(
      async (prompts: SAMPrompt[], bbox?: SAMBboxPrompt | null): Promise<void> => {
        if (!workerRef.current || !enabledRef.current) {
          clearSamMask();
          return;
        }

        // Require at least one prompt or bbox
        const hasPoints = prompts && prompts.length > 0;
        const hasBbox = !!bbox;
        if (!hasPoints && !hasBbox) {
          clearSamMask();
          return;
        }

        // Wait for models to be ready before generating mask
        if (!modelsReadyRef.current) {
          console.log('[SAM Orchestrator] Waiting for models to be ready before generating mask...');
          try {
            await new Promise<void>((resolve, reject) => {
              // Same timeout as bootstrapWorker
              const timeout = setTimeout(() => reject(new Error('Models initialization timed out')), 180_000);
              const handler = (e: MessageEvent) => {
                const msg = e.data;
                if (msg.type === 'MODELS_READY') {
                  clearTimeout(timeout);
                  workerRef.current?.removeEventListener('message', handler);
                  resolve();
                } else if (msg.type === 'ERROR') {
                  clearTimeout(timeout);
                  workerRef.current?.removeEventListener('message', handler);
                  reject(new Error(msg.data?.message || 'Worker error'));
                }
              };
              workerRef.current?.addEventListener('message', handler);
            });
          } catch (err) {
            console.error('[SAM Orchestrator] Model readiness check failed:', err);
            return;
          }
        }

      const origW = imgDimensions?.width ?? 1024;
      const origH = imgDimensions?.height ?? 1024;

            try {
        // Convert prompts from image coordinates to model (1024×1024) coordinates
        const modelPrompts = hasPoints
          ? prompts
              .map((p) => {
                const coords = mapClickToModel(p.x, p.y, origW, origH, SAM_TENSOR_SIZE);
                if (!coords) return null;
                return {
                  x: coords.x,
                  y: coords.y,
                  type: p.type,
                };
              })
              .filter((p): p is { x: number; y: number; type: 'positive' | 'negative' } => p !== null)
          : [];

        // Convert bbox to model coordinates
        let modelBox: { x1: number; y1: number; x2: number; y2: number } | undefined;
        if (hasBbox && bbox) {
          const mapped = mapBboxToModel(
            bbox.x1, bbox.y1, bbox.x2, bbox.y2,
            origW, origH,
            SAM_TENSOR_SIZE
          );
          if (mapped) modelBox = mapped;
        }

                if (modelPrompts.length === 0 && !modelBox) {
          clearSamMask();
          return;
        }

                // Send GENERATE_MASK to worker
                const maskResult = await new Promise<{
                  mask: ArrayBuffer;
                  width: number;
                  height: number;
                  lowResMask: ArrayBuffer;
                  lowResWidth: number;
                  lowResHeight: number;
                }>((resolve, reject) => {
                                    // Mask generation timeout: 30s should be enough for 256x256 output
                  let timedOut = false;
                  const timeout = setTimeout(() => {
                    timedOut = true;
                    if (workerRef.current) {
                      workerRef.current.removeEventListener('message', handler);
                    }
                    reject(new Error('Mask generation timed out (30s) — decoder may be stuck or model not responding'));
                  }, 30_000);

          const handler = (e: MessageEvent) => {
            if (timedOut) return; // Ignore messages after timeout
            const msg = e.data;
            if (msg.type === 'MASK_GENERATED') {
              clearTimeout(timeout);
              workerRef.current?.removeEventListener('message', handler);
              console.log('[SAM Orchestrator] MASK_GENERATED received');
                            resolve({
                mask: msg.data.mask as ArrayBuffer,
                width: msg.data.width as number,
                height: msg.data.height as number,
                lowResMask: msg.data.lowResMask as ArrayBuffer,
                lowResWidth: msg.data.lowResWidth as number,
                lowResHeight: msg.data.lowResHeight as number,
              });
            } else if (msg.type === 'ERROR') {
              clearTimeout(timeout);
              workerRef.current?.removeEventListener('message', handler);
              console.error('[SAM Orchestrator] Worker ERROR:', msg.data?.message);
              reject(new Error(`Mask generation error: ${msg.data?.message ?? 'Unknown error'}`));
            } else if (msg.type === 'LOG') {
              // Log messages for debugging but don't remove handler
              console.log('[SAM Worker]', ...(msg.data?.args ?? []));
            }
          };

          workerRef.current!.addEventListener('message', handler);

                    console.error('[SAM Orchestrator DEBUG] Sending GENERATE_MASK to worker. prompts:', modelPrompts.length, 'box:', !!modelBox, 'origW:', origW, 'origH:', origH); // CRITICAL DEBUG
          workerRef.current!.postMessage({
            type: 'GENERATE_MASK',
            data: {
              prompts: modelPrompts,
              box: modelBox,
              originalWidth: origW,
              originalHeight: origH,
            },
          });
          console.error('[SAM Orchestrator DEBUG] GENERATE_MASK sent!'); // CRITICAL DEBUG
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

                                // cropAndScaleMask handles:
        //   1. Tensor dimension detection (always 1024×1024 from worker)
        //   2. Padding cropping → extracts ONLY the scaled image region
        //   3. Threshold at logit > 0.0 (sigmoid-equivalent, no min/max normalization)
        //   4. Nearest-neighbor scaling to original image dimensions
        const tensorData = new Float32Array(maskResult.mask);
        const tensorSize = Math.max(maskWidthFromWorker, maskHeightFromWorker);
        console.log('[SAM Orchestrator] Tensor data length:', tensorData.length, 'Float32 elements');
        console.log('[SAM Orchestrator] Original image dims:', origW, 'x', origH);
        console.log('[SAM Orchestrator] Using cropAndScaleMask with tensorSize:', tensorSize);

        const { maskData, maskWidth, maskHeight } = cropAndScaleMask(
          tensorData,
          tensorSize,
          origW,
          origH,
          SAM_TENSOR_SIZE
        );

        const nonZeroCount = maskData.reduce((sum, v) => sum + (v > 0 ? 1 : 0), 0);
        console.log('[SAM Orchestrator] Mask data stats:', { 
          maskWidth, 
          maskHeight, 
          maskDataLength: maskData.length,
          nonZeroCount
        });

                if (nonZeroCount === 0) {
          console.log('[SAM Orchestrator] No mask detected. Triggering warning.');
          clearSamMask();
          const { setSamWarning, removeSamPrompt, samPrompts, samBboxPrompt } = useAppStore.getState();
          setSamWarning('sam.noMaskFound');

          if (samBboxPrompt) {
            // Bbox prompt produced no mask — clear it
            useAppStore.getState().setSamBboxPrompt(null);
          } else if (samPrompts.length > 0) {
            // Point prompt produced no mask — remove last prompt
            removeSamPrompt(samPrompts.length - 1);
          }

          // Clear warning after 3 seconds
          setTimeout(() => {
            if (isMountedRef.current && useAppStore.getState().samWarning === 'sam.noMaskFound') {
              useAppStore.getState().setSamWarning(null);
            }
          }, 3000);

          return;
        }

        // Convert the mask to a renderable PNG blob (offloaded to worker)
        const maskBlobUrl = await offloadMaskToBlobUrl(maskData, maskWidth, maskHeight);

                if (isMountedRef.current && imageIdRef.current === imageId) {
          // Revoke previous mask URL
          clearSamMask();
          // Store raw mask data for polygon conversion
          setSamMaskData({ maskData, width: maskWidth, height: maskHeight });
          setSamMaskBlobUrl(maskBlobUrl);

                    // Store low-res logit data for d3-contour polygon conversion
          // lowResMask is [1, 1, H, W] where H=W=256 — extract first channel
          const lowResBuffer = maskResult.lowResMask;
          if (lowResBuffer && lowResBuffer.byteLength > 0) {
            const lowResWidth = maskResult.lowResWidth;
            const lowResHeight = maskResult.lowResHeight;
            const logitCount = lowResWidth * lowResHeight;
            const rawLogits = new Float32Array(lowResBuffer);

            // The worker sends the first channel data (length = H*W)
            const logits = rawLogits.length >= logitCount
              ? new Float32Array(rawLogits.subarray(0, logitCount))
              : new Float32Array(rawLogits);

            // Compute padding/scaling parameters for contour coordinate conversion
            const { padX, padY, scaleRatio } = getScaledDims(origW, origH, SAM_TENSOR_SIZE);

            const logitData: SamLogitData = {
              logits,
              width: lowResWidth,
              height: lowResHeight,
              originalWidth: origW,
              originalHeight: origH,
              tensorSize: SAM_TENSOR_SIZE,
              padX,
              padY,
              scaleRatio,
            };
            setSamLogitData(logitData);
            console.log('[SAM Orchestrator] Low-res logit data stored:', lowResWidth, 'x', lowResHeight, 'padX:', padX, 'padY:', padY, 'scaleRatio:', scaleRatio);
          } else {
            console.warn('[SAM Orchestrator] No low-res mask data available from worker');
          }

          console.log('[SAM Orchestrator] Mask blob URL set');
        }
      } catch (err) {
        console.error('[SAM Orchestrator] Mask generation failed:', err);
        clearSamMask();
      }
    },
    [imgDimensions, clearSamMask, setSamMaskBlobUrl, setSamMaskData, imageId]
  );

  // ─── Reset Session ────────────────────────────────────────────────────────

    const resetSession = useCallback(() => {
    abortControllerRef.current?.abort();
    workerRef.current?.terminate();
    workerRef.current = null;
    isInitializedRef.current = false;
    modelsReadyRef.current = false;
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
  const samBboxPrompt = useAppStore((s) => s.samBboxPrompt);

  useEffect(() => {
    if (samStatus !== 'ready') return;

    const prompts = useAppStore.getState().samPrompts;
    const bbox = useAppStore.getState().samBboxPrompt;

    if (prompts.length === 0 && !bbox) {
      clearSamMask();
      return;
    }

    // Generate mask for the current prompts/bbox
    generateMask(prompts, bbox);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [samStatus, samPromptCount, samBboxPrompt, generateMask, clearSamMask]);

  // ─── Return ───────────────────────────────────────────────────────────────

    return {
    status: samStatus,
    isReady: enabled && samStatus === 'ready' && useAppStore.getState().samEmbeddingReady,
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
    }, 30_000);

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
    img.crossOrigin = 'anonymous';

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

    // Clone the ImageData buffer properly respecting byteOffset & byteLength,
    // then transfer the clone for zero-copy efficiency
    const cloned = new Uint8ClampedArray(imageData.data);
    const clonedImageData = new ImageData(cloned, imageData.width, imageData.height);
    worker.postMessage(
      {
        type: 'COMPUTE_EMBEDDING',
        data: {
          imageData: clonedImageData,
          originalWidth,
          originalHeight,
          outputDims,
        },
      },
      { transfer: [cloned.buffer] }
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
