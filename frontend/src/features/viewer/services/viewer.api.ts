/**
 * viewer.api.ts
 *
 * Viewer moduna özgü API istemci servisi (read-only).
 * Annotation modu için annotation.api.ts kullanılır.
 */
import apiService from '@/shared/services/api';
import type { AnnotationData, TaskImage } from '../../annotation/types/annotation.types';

// ─── GET /images/{imageId} ────────────────────────────────────────────────────

/**
 * Tek bir resmin meta verisini ve presigned URL'lerini getirir.
 */
export async function getImageMeta(imageId: string): Promise<TaskImage> {
  return apiService.get<TaskImage>(`/images/${imageId}`);
}

// ─── GET /images/{imageId}/annotations ───────────────────────────────────────

/**
 * Viewer modunda bir resmin annotation'larını salt-okunur olarak getirir.
 */
export async function getAnnotationsReadOnly(imageId: string): Promise<AnnotationData> {
  return apiService.get<AnnotationData>(`/images/${imageId}/annotations`);
}
