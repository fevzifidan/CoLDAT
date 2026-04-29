import { useEffect, useState } from 'react';
import { useAppStore } from '../../../store/hooks/useAppStore';
import type { ClassDef, RelationType, AnnotatedObject, ObjectRelation } from '../types/annotation.types';

// ─── Mock Data (kullanılan sadece test modunda) ───────────────────────────────

export const MOCK_CLASSES: ClassDef[] = [
  { id: 'cls-car', name: 'Car', color: '#3b82f6', count: 1 },
  { id: 'cls-ped', name: 'Pedestrian', color: '#ef4444', count: 2 },
  { id: 'cls-light', name: 'Traffic Light', color: '#f59e0b', count: 3 },
  { id: 'cls-sign', name: 'Road Sign', color: '#10b981', count: 0 },
  { id: 'cls-truck', name: 'Truck', color: '#8b5cf6', count: 0 },
];

export const MOCK_RELATION_TYPES: RelationType[] = [
  { id: 'rel-drives', name: 'DRIVES', directed: true },
  { id: 'rel-stops', name: 'STOPS AT', directed: true },
  { id: 'rel-crosses', name: 'CROSSES', directed: true },
  { id: 'rel-follows', name: 'FOLLOWS', directed: true },
];

/** API'den gelen AnnotationData → UI AnnotatedObject dönüşümü */
function mapApiObjectToUI(
  apiObj: { id: string; class_id: string; type: 'bbox' | 'polygon' | 'keypoint'; coordinates: number[] },
  classMap: Map<string, ClassDef>,
  index: number
): AnnotatedObject {
  const cls = classMap.get(apiObj.class_id);
  return {
    id: apiObj.id,
    label: cls ? `${cls.name}_${String(index + 1).padStart(2, '0')}` : apiObj.id,
    classId: apiObj.class_id,
    type: apiObj.type,
    coordinates: apiObj.coordinates,
    color: cls?.color ?? '#6366f1',
    zIndex: index,
    visible: true,
    locked: false,
  };
}

/** API'den gelen relationship → UI ObjectRelation dönüşümü */
function mapApiRelationToUI(
  rel: { subject_id: string; object_id: string; predicate: string },
  objectsMap: Map<string, AnnotatedObject>
): ObjectRelation {
  const src = objectsMap.get(rel.subject_id);
  const tgt = objectsMap.get(rel.object_id);
  return {
    id: `${rel.subject_id}-${rel.object_id}-${rel.predicate}`,
    sourceId: rel.subject_id,
    sourceLabel: src?.label ?? rel.subject_id,
    targetId: rel.object_id,
    targetLabel: tgt?.label ?? rel.object_id,
    relationTypeId: rel.predicate,
    relationTypeName: rel.predicate,
  };
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

const IS_TEST_MODE = import.meta.env.VITE_TEST_MODE === 'true';

export function useAnnotationData(imageId: string) {
  const setAnnotatedObjects = useAppStore(state => state.setAnnotatedObjects);
  const setObjectRelations = useAppStore(state => state.setObjectRelations);
  const [isLoadingAnnotations, setIsLoadingAnnotations] = useState(false);

  useEffect(() => {
    if (IS_TEST_MODE) {
      // ── Test modu: mock verilerle seed ──────────────────────────────────────
      setAnnotatedObjects([
        {
          id: 'obj-1',
          label: 'Car_01',
          classId: 'cls-car',
          type: 'bbox',
          color: '#3b82f6',
          coordinates: [452, 320, 160, 120],
          zIndex: 2,
          visible: true,
          locked: false,
        },
        {
          id: 'obj-2',
          label: 'Pedestrian_03',
          classId: 'cls-ped',
          type: 'bbox',
          color: '#f59e0b',
          coordinates: [210, 180, 80, 130],
          zIndex: 1,
          visible: true,
          locked: false,
        },
      ]);
      setObjectRelations([
        {
          id: 'rel-1',
          sourceId: 'obj-2',
          sourceLabel: 'Pedestrian_03',
          targetId: 'obj-1',
          targetLabel: 'Car_01',
          relationTypeId: 'rel-drives',
          relationTypeName: 'DRIVES',
        },
      ]);
      return;
    }

    // ── Production modu: API'den yükle ─────────────────────────────────────
    if (!imageId) return;

    let cancelled = false;
    setIsLoadingAnnotations(true);

    import('../services/annotation.api').then(async ({ getAnnotations }) => {
      try {
        const data = await getAnnotations(imageId);
        if (cancelled) return;

        const classMap = new Map(MOCK_CLASSES.map(c => [c.id, c]));
        const uiObjects = data.objects.map((obj, i) => mapApiObjectToUI(obj, classMap, i));
        const objectsMap = new Map(uiObjects.map(o => [o.id, o]));
        const uiRelations = data.relationships.map(r => mapApiRelationToUI(r, objectsMap));

        setAnnotatedObjects(uiObjects);
        setObjectRelations(uiRelations);
      } finally {
        if (!cancelled) setIsLoadingAnnotations(false);
      }
    });

    return () => { cancelled = true; };
  }, [imageId, setAnnotatedObjects, setObjectRelations]);

  return {
    classes: MOCK_CLASSES,
    relationTypes: MOCK_RELATION_TYPES,
    totalImages: 1024,
    isLoadingAnnotations,
  };
}
