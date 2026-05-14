/**
 * SAM Tool — Barrel Export
 *
 * Re-exports all MobileSAM tool utilities for clean imports.
 */

// Caching
export { saveEmbedding, getEmbedding, removeEmbedding, clearCache, estimateQuota, getCacheSize } from './embeddingCache';

// Coordinate transforms
export { getScaleRatio, getScaledDims, mapClickToModel, mapModelToImage, cropAndScaleMask, SAM_TENSOR_SIZE } from './samCoords';

// Orchestrator (hybrid flow manager)
export { useSamOrchestrator } from './useSamOrchestrator';

// Web Worker (instantiated by the orchestrator, not directly exported)
// Worker is used via: new Worker(new URL('./samWorker', import.meta.url), { type: 'module' })

export { useSamInteraction } from './useSamInteraction';
export { SamCanvas } from './SamCanvas';
export { SamProcessingOverlay } from './SamProcessingOverlay';

