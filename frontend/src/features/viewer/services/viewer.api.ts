/**
 * viewer.api.ts
 *
 * Viewer moduna özgü API istemci servisi (read-only).
 * Annotation modu için annotation.api.ts kullanılır.
 */
import apiService from '@/shared/services/api';
import type { AnnotationData } from '../../annotation/types/annotation.types';

// ─── GET /images/{imageId}/annotations ───────────────────────────────────────

/**
 * Viewer modunda bir resmin annotation'larını salt-okunur olarak getirir.
 */
export async function getAnnotationsReadOnly(imageId: string): Promise<AnnotationData> {
  return apiService.get<AnnotationData>(`/images/${imageId}/annotations`);
}
