/**
 * embeddingCache.ts
 *
 * A thin localforage-based caching utility for MobileSAM embedding ArrayBuffers.
 *
 * CRITICAL: This store is configured to use ONLY IndexedDB driver.
 * ArrayBuffer values can be 4MB+ and must NOT go through localStorage (quota limit)
 * or WebSQL (no binary support). IndexedDB is the only suitable built-in backend.
 *
 * Key structure:
 *   Key:   imageId (string) — the asset_id from the backend
 *   Value: ArrayBuffer     — the raw embedding tensor bytes
 *
 * Usage:
 *   import { saveEmbedding, getEmbedding } from './embeddingCache';
 *
 *   // Save after local computation or S3 download
 *   await saveEmbedding('img-abc-123', embeddingBuffer);
 *
 *   // Retrieve before checking S3
 *   const cached = await getEmbedding('img-abc-123');
 *   if (cached) {
 *     // ship to worker via Transferable
 *   }
 */

import localforage from 'localforage';

// ─── Singleton Store Instance ────────────────────────────────────────────────

const embeddingStore = localforage.createInstance({
  name: 'CoLDAT_SAM_Cache',
  storeName: 'embeddings',
  description: 'MobileSAM embedding tensor cache (ArrayBuffers)',
  driver: localforage.INDEXEDDB,
});

// Verify the driver was set correctly; log a warning if it fell back.
(async function verifyDriver() {
  try {
    const driver = await embeddingStore.driver();
    if (driver !== localforage.INDEXEDDB) {
      console.warn(
        '[SAM Cache] Expected IndexedDB driver but got:',
        driver,
        'ArrayBuffer caching may be unreliable.'
      );
    }
  } catch {
    console.warn('[SAM Cache] Could not verify IndexedDB driver availability.');
  }
})();

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Persist an embedding ArrayBuffer for the given imageId.
 * The buffer is stored as-is; no serialization overhead.
 *
 * @param imageId  — The asset_id of the image
 * @param buffer   — Raw ArrayBuffer of the MobileSAM embedding tensor
 */
export async function saveEmbedding(
  imageId: string,
  buffer: ArrayBuffer
): Promise<void> {
  if (!imageId) throw new Error('[SAM Cache] saveEmbedding requires a non-empty imageId');
  if (!buffer || buffer.byteLength === 0) {
    console.warn('[SAM Cache] Attempted to save an empty buffer for', imageId);
    return;
  }

  try {
    await embeddingStore.setItem(imageId, buffer);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[SAM Cache] Failed to save embedding for ${imageId}:`, msg);

    // If the error is quota-related, attempt a partial eviction
    if (
      msg.toLowerCase().includes('quota') ||
      msg.toLowerCase().includes('full') ||
      msg.toLowerCase().includes('no available storage space')
    ) {
      console.warn('[SAM Cache] Storage quota exceeded. Evicting oldest entries...');
      await evictOldestEntries(5);
      // Retry once after eviction
      await embeddingStore.setItem(imageId, buffer);
    } else {
      throw err; // Re-throw unexpected errors
    }
  }
}

/**
 * Retrieve a cached embedding ArrayBuffer for the given imageId.
 *
 * @param imageId — The asset_id of the image
 * @returns The ArrayBuffer, or null if no cached entry exists
 */
export async function getEmbedding(
  imageId: string
): Promise<ArrayBuffer | null> {
  if (!imageId) return null;

  try {
    const result = await embeddingStore.getItem<ArrayBuffer>(imageId);
    return result ?? null;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[SAM Cache] Failed to read embedding for ${imageId}:`, msg);
    return null;
  }
}

/**
 * Remove a single cached embedding entry.
 *
 * @param imageId — The asset_id of the image to evict
 */
export async function removeEmbedding(imageId: string): Promise<void> {
  if (!imageId) return;

  try {
    await embeddingStore.removeItem(imageId);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[SAM Cache] Failed to remove embedding for ${imageId}:`, msg);
  }
}

/**
 * Estimate storage usage for this cache store.
 * Uses the Storage Manager API where available.
 *
 * @returns Usage and quota info in bytes, or null if unavailable
 */
export async function estimateQuota(): Promise<{
  usage: number;
  quota: number;
} | null> {
  if (!navigator.storage?.estimate) return null;

  try {
    const estimate = await navigator.storage.estimate();
    return {
      usage: estimate.usage ?? 0,
      quota: estimate.quota ?? 0,
    };
  } catch {
    return null;
  }
}

/**
 * Get the total number of cached embeddings.
 */
export async function getCacheSize(): Promise<number> {
  try {
    const keys = await embeddingStore.keys();
    return keys.length;
  } catch {
    return 0;
  }
}

/**
 * Clear the entire embedding cache.
 * Use with caution — this removes all locally stored embeddings.
 */
export async function clearCache(): Promise<void> {
  try {
    await embeddingStore.clear();
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[SAM Cache] Failed to clear cache:', msg);
  }
}

// ─── Internal Helpers ────────────────────────────────────────────────────────

/**
 * Evict the oldest N entries from the cache.
 * localforage iterates keys in insertion order, so oldest entries come first.
 *
 * @param count — Number of entries to remove (oldest first)
 */
async function evictOldestEntries(count: number): Promise<void> {
  const keysToEvict: string[] = [];

  try {
    await embeddingStore.iterate<string, void>((_value, key, iterationNumber) => {
      if (iterationNumber <= count) {
        keysToEvict.push(key);
      }
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[SAM Cache] Failed to iterate for eviction:', msg);
    return;
  }

  for (const key of keysToEvict) {
    try {
      await embeddingStore.removeItem(key);
    } catch {
      // Best-effort per entry
    }
  }

  console.info(`[SAM Cache] Evicted ${keysToEvict.length} entries to free space.`);
}
