/**
 * annotation.api.ts
 *
 * Annotation moduna özgü API istemci servisi.
 * Merkezi apiService ve notificationService üzerine inşa edilmiştir.
 * Viewer modu için viewer.api.ts kullanılır.
 */
import apiService from '@/shared/services/api';
import notificationService from '@/shared/services/notification';
import type {
  AnnotationData,
  TaskImage,
  TaskImagesResponse,
  Task,
  TaxonomyResponse,
  DatasetDetails,
} from '../types/annotation.types';
import { useAppStore } from '@/store/hooks/useAppStore';

// ─── GET /tasks/{taskId}/images ───────────────────────────────────────────────

/**
 * Task'a ait resimleri cursor-based paginated olarak getirir.
 * next_cursor null ise daha fazla sayfa yoktur.
 */
export async function getTaskImages(
  taskId: string,
  limit: number = 50,
  cursor: string | null = null
): Promise<TaskImagesResponse> {
  const params = new URLSearchParams({ limit: String(limit) });
  if (cursor) params.append('after', cursor);

  return apiService.get<TaskImagesResponse>(
    `/tasks/${taskId}/images?${params.toString()}`
  );
}

// ─── GET /images/{imageId}/annotations ───────────────────────────────────────

/**
 * Bir resme ait mevcut annotation'ları (nesneler + ilişkiler) getirir.
 * Pagination yoktur; tüm veriler tek istekte döner.
 */
export async function getAnnotations(imageId: string): Promise<AnnotationData> {
  return apiService.get<AnnotationData>(`/images/${imageId}/annotations`);
}

// ─── PUT /images/{imageId}/annotations ───────────────────────────────────────

/**
 * Bir resmin annotation verilerini kaydeder (auto-save veya manuel save).
 *
 * @param silent - true ise başarı toast'u gösterilmez (auto-save için).
 */
export async function saveAnnotations(
  imageId: string,
  data: AnnotationData,
  silent: boolean = false
): Promise<void> {
  // Hard block if in read-only mode
  if (useAppStore.getState().isReadOnly) {
    console.warn('[API Block] Attempted to save annotations in read-only mode.');
    return;
  }
  
  await apiService.put(`/images/${imageId}/annotations`, data);

  if (!silent) {
    notificationService.success('Annotations saved successfully.');
  }
}

// ─── DELETE /images/{imageId}/annotations ────────────────────────────────────

/**
 * Bir resmin tüm annotation verilerini (nesneler + ilişkiler) kalıcı olarak siler.
 * Backend 204 No Content döner.
 */
export async function clearAnnotations(imageId: string): Promise<void> {
  // Hard block if in read-only mode
  if (useAppStore.getState().isReadOnly) {
    console.warn('[API Block] Attempted to clear annotations in read-only mode.');
    return;
  }

  await apiService.delete(`/images/${imageId}/annotations`);
}

// ─── DELETE /images/{imageId} ────────────────────────────────────────────────

/**
 * Bir resmi ve tüm annotation'larını kalıcı olarak siler.
 *
 * ⚠️ Bu endpoint yalnızca proje admini tarafından çağrılabilir.
 * UI'da çağrı öncesi rol kontrolü yapılmalıdır.
 */
export async function deleteImage(imageId: string): Promise<void> {
  // Hard block if in read-only mode
  if (useAppStore.getState().isReadOnly) {
    console.warn('[API Block] Attempted to delete image in read-only mode.');
    return;
  }

  await apiService.delete(`/images/${imageId}`);
}

// ─── GET /tasks/{taskId} ────────────────────────────────────────────────────
/** Görev detaylarını (rol, durum, dataset_id vb.) getirir. */
export async function getTaskDetails(taskId: string): Promise<Task> {
  return apiService.get<Task>(`/tasks/${taskId}`);
}

// ─── GET /projects/{projectId}/taxonomy ──────────────────────────────────────
/** Projeye ait sınıf ve ilişki tiplerini getirir. */
export async function getProjectTaxonomy(projectId: string): Promise<TaxonomyResponse> {
  return apiService.get<TaxonomyResponse>(`/projects/${projectId}/taxonomy`);
}

// ─── PATCH /tasks/{taskId}/status ─────────────────────────────────────────────
/** Görev durumunu günceller (onaya gönderme, tamamlama vb.). */
export async function updateTaskStatus(
  taskId: string, 
  status: string, 
  note?: string
): Promise<void> {
  await apiService.patch(`/tasks/${taskId}/status`, { status, note });
}

// ─── GET /datasets/{datasetId} ───────────────────────────────────────────────
/** Dataset detaylarını (ve içindeki projectId'yi) getirir. */
export async function getDatasetDetails(datasetId: string): Promise<DatasetDetails> {
  return apiService.get<DatasetDetails>(`/datasets/${datasetId}`);
}

// ─── Presigned URL Yenileme Yardımcısı ───────────────────────────────────────
/**
 * Resmin asset_url veya sam_embedding_url'inin süresinin dolup dolmadığını kontrol eder.
 * Süresi dolmuşsa yeni bir TaskImage verisiyle taze URL alınması için
 * getTaskImages() tekrar çağrılmalıdır.
 */
export function isPresignedUrlExpired(image: TaskImage): boolean {
  const now = Date.now();
  const expiry = new Date(image.asset_url_expiry_at).getTime();
  // 60 saniyelik güvenlik payı bırakıyoruz
  return expiry - now < 60_000;
}
