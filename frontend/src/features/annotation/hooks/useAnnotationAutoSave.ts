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
import { Logger } from '@/shared/services/logging/logging';

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
      class_id: obj.classId,
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
    } catch (error) {
      Logger.error("Annotation auto-save failed", {
        objectCount: useAppStore.getState().annotatedObjects.length,
        relationCount: useAppStore.getState().objectRelations.length,
        objects: useAppStore.getState().annotatedObjects.map(o => ({ id: o.id, label: o.label, classId: o.classId })),
        relations: useAppStore.getState().objectRelations.map(r => ({ sourceId: r.sourceId, targetId: r.targetId, type: r.relationTypeName })),
        errorMessage: error instanceof Error ? error.message : String(error),
        status: error.response?.status,
        traceId: Logger.getTraceId(),
      });
      throw error;
    } finally {
      isSavingRef.current = false;
      setIsSaving(false);
    }
  }, [imageId]);

  // ─── Periyodik auto-save (sessiz) ───────────────────────────────────────────
  useEffect(() => {
    if (!imageId) return;

    const intervalId = setInterval(() => {
      doSave(true /* silent */);
    }, AUTO_SAVE_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [imageId, doSave]);

  /** Manuel save — Ctrl+S veya toolbar butonu tarafından çağrılır */
  const saveNow = useCallback(() => doSave(false /* not silent */), [doSave]);

  return { isSaving, saveNow };
}
