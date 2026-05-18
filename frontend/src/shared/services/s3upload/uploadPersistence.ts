/**
 * Upload Persistence — localForage ile yükleme task metadata'sını kalıcı hale getirir.
 *
 * Sadece serialize edilebilir alanları saklar:
 * - File, AbortController, XHR gibi runtime-only nesneler kaydedilmez
 * - Sayfa yenilendiğinde File kaybolacağı için aktif yüklemeler FAILED olur
 * - SUCCESS/FAILED/CANCELLED task'ler geçmiş olarak görünmeye devam eder
 */
import localforage from 'localforage';
import type { UploadTask } from './types';

/** Kalıcı depoda saklanacak serialize edilebilir task alanları */
export interface PersistedTask {
  upload_id: string;
  upload_type: 'asset' | 'embedding';
  hidden?: boolean;
  asset_id?: string;
  dataset_id: string;
  priority: 'HIGH' | 'LOW';
  status: 'IDLE' | 'PREPROCESSING' | 'HASHING' | 'REQUESTING_URL' | 'UPLOADING' | 'SUCCESS' | 'FAILED' | 'CANCELLED';
  progress: number;
  isRetry?: boolean;
  hash?: string;
  width?: number;
  height?: number;
  upload_url?: string;
  expiry_at?: string;
  /** Dosya adı (kullanıcıya göstermek için) */
  fileName: string;
  /** Dosya boyutu byte cinsinden */
  fileSize: number;
  /** Dosya MIME tipi */
  fileType: string;
}

const STORAGE_KEY = 's3_upload_tasks';

const persistenceStore = localforage.createInstance({
  name: 'CoLDAT_Upload',
  storeName: 'upload_tasks',
  description: 'S3 Upload Manager task metadata',
});

/**
 * Tüm task'leri localForage'dan yükler.
 */
export async function loadPersistedTasks(): Promise<Map<string, PersistedTask>> {
  try {
    const stored = await persistenceStore.getItem<PersistedTask[]>(STORAGE_KEY);
    if (!stored || !Array.isArray(stored)) return new Map();
    return new Map(stored.map(t => [t.upload_id, t]));
  } catch (err) {
    console.error('[UploadPersistence] Failed to load tasks:', err);
    return new Map();
  }
}

/**
 * Mevcut task listesini localForage'a kaydeder.
 * Sadece serialize edilebilir alanları saklar.
 */
export async function saveTasks(tasks: Map<string, UploadTask>): Promise<void> {
  try {
    const persisted: PersistedTask[] = [];
    tasks.forEach((task) => {
      persisted.push({
        upload_id: task.upload_id,
        upload_type: task.upload_type,
        hidden: task.hidden,
        asset_id: task.asset_id,
        dataset_id: task.dataset_id,
        priority: task.priority,
        status: task.status,
        progress: task.progress,
        isRetry: task.isRetry,
        hash: task.hash,
        width: task.width,
        height: task.height,
        upload_url: task.upload_url,
        expiry_at: task.expiry_at,
        fileName: task.file.name,
        fileSize: task.file.size,
        fileType: task.file.type,
      });
    });
    await persistenceStore.setItem(STORAGE_KEY, persisted);
  } catch (err) {
    console.error('[UploadPersistence] Failed to save tasks:', err);
  }
}

/**
 * Belirli bir task'i kalıcı depodan siler.
 */
export async function removePersistedTask(upload_id: string): Promise<void> {
  try {
    const stored = await loadPersistedTasks();
    stored.delete(upload_id);
    const tasks = Array.from(stored.values()).map(t => ({
      ...t,
    }));
    await persistenceStore.setItem(STORAGE_KEY, tasks);
  } catch (err) {
    console.error('[UploadPersistence] Failed to remove task:', err);
  }
}

/**
 * Tüm kalıcı depoyu temizler (dismiss all gibi durumlarda).
 */
export async function clearPersistedTasks(): Promise<void> {
  try {
    await persistenceStore.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('[UploadPersistence] Failed to clear tasks:', err);
  }
}
