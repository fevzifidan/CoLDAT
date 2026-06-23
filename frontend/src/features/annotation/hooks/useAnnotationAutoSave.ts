/**
 * useAnnotationAutoSave.ts
 *
 * Annotation verilerini periyodik (60 saniye) ve manuel olarak kaydeden hook.
 *
 * - Periyodik save sessiz çalışır (toast göstermez)
 * - Manuel save başarılı olursa success toast gösterilir
 * - Test modunda annotation.api.mock.ts kullanılır
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { useAppStore } from '../../../store/hooks/useAppStore';
import type { AnnotationData } from '../types/annotation.types';

const IS_TEST_MODE = import.meta.env.VITE_TEST_MODE === 'true';
const AUTO_SAVE_INTERVAL_MS = 60_000; // 60 saniye

/**
 * Zustand store'daki annotation verilerini API formatına dönüştürür.
 */
function buildAnnotationPayload(
  objects: ReturnType<typeof useAppStore.getState>['annotatedObjects'],
  relations: ReturnType<typeof useAppStore.getState>['objectRelations']
): AnnotationData {
  return {
    objects: objects.map(obj => ({
      id: obj.id,
      class_id: obj.classId || null,
      type: obj.type,
      coordinates: obj.coordinates,
    })),
    relationships: relations.map(rel => ({
      subject_id: rel.sourceId,
      object_id: rel.targetId,
      predicate: rel.relationTypeName,
    })),
  };
}

export function useAnnotationAutoSave(imageId: string) {
  const [isSaving, setIsSaving] = useState(false);
  const isSavingRef = useRef(false);

    const doSave = useCallback(async (silent: boolean) => {
    if (!imageId || isSavingRef.current) return;

    // Read-only modda save işlemini engelle (approval_pending, completed veya Viewer rolü)
    const { isReadOnly } = useAppStore.getState();
    if (isReadOnly) {
      if (!silent) {
        console.warn('[AutoSave] Save blocked: task is in read-only mode.');
      }
      return;
    }

    isSavingRef.current = true;
    setIsSaving(true);

    try {
      const { annotatedObjects, objectRelations } = useAppStore.getState();
      const payload = buildAnnotationPayload(annotatedObjects, objectRelations);

      if (IS_TEST_MODE) {
        const { saveAnnotations } = await import('../services/annotation.api.mock');
        await saveAnnotations(imageId, payload, silent);
      } else {
        const { saveAnnotations } = await import('../services/annotation.api');
        await saveAnnotations(imageId, payload, silent);
      }
    } finally {
      isSavingRef.current = false;
      setIsSaving(false);
    }
  }, [imageId]);

    // ─── Periyodik auto-save (sessiz) ───────────────────────────────────────────
  useEffect(() => {
    if (!imageId) return;

    // Read-only modda auto-save interval'ı başlatma
    const { isReadOnly } = useAppStore.getState();
    if (isReadOnly) return;

    const intervalId = setInterval(() => {
      doSave(true /* silent */);
    }, AUTO_SAVE_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [imageId, doSave]);

  /** Manuel save — Ctrl+S veya toolbar butonu tarafından çağrılır */
  const saveNow = useCallback(() => doSave(false /* not silent */), [doSave]);

  return { isSaving, saveNow };
}
