/**
 * viewer.api.mock.ts
 *
 * Viewer modu için test API servisi.
 * viewer.api.ts ile aynı fonksiyon imzalarına sahiptir.
 * VITE_TEST_MODE=true olduğunda bu servis kullanılır.
 */
import type { AnnotationData } from '../../annotation/types/annotation.types';

const MOCK_ANNOTATION_DATA: AnnotationData = {
  objects: [
    {
      id: 'obj-1',
      class_id: 'cls-car',
      type: 'bbox',
      coordinates: [452, 320, 160, 120],
    },
    {
      id: 'obj-2',
      class_id: 'cls-ped',
      type: 'bbox',
      coordinates: [210, 180, 80, 130],
    },
  ],
  relationships: [
    {
      subject_id: 'obj-2',
      object_id: 'obj-1',
      predicate: 'DRIVES',
    },
  ],
};

const delay = (ms = 300) => new Promise((res) => setTimeout(res, ms));

export async function getAnnotationsReadOnly(_imageId: string): Promise<AnnotationData> {
  await delay();
  return MOCK_ANNOTATION_DATA;
}
