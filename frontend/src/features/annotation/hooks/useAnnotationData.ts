import { useEffect, useState, useMemo } from 'react';
import { useAppStore } from '../../../store/hooks/useAppStore';
import type { ClassDef, RelationType, AnnotatedObject, ObjectRelation } from '../types/annotation.types';

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
  objectsMap: Map<string, AnnotatedObject>,
  relationTypes: RelationType[]
): ObjectRelation {
  const src = objectsMap.get(rel.subject_id);
  const tgt = objectsMap.get(rel.object_id);
  const relType = relationTypes.find(rt => rt.id === rel.predicate || rt.name === rel.predicate);

  return {
    id: `${rel.subject_id}-${rel.object_id}-${rel.predicate}`,
    sourceId: rel.subject_id,
    sourceLabel: src?.label ?? rel.subject_id,
    targetId: rel.object_id,
    targetLabel: tgt?.label ?? rel.object_id,
    relationTypeId: relType?.id ?? rel.predicate,
    relationTypeName: relType?.name ?? rel.predicate,
  };
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

const IS_TEST_MODE = import.meta.env.VITE_TEST_MODE === 'true';

export function useAnnotationData(taskId: string, imageId: string) {
  const {
    setAnnotatedObjects,
    setObjectRelations,
    setTaxonomy,
    setTaskContext,
    setReadOnly,
    taxonomy
  } = useAppStore();

  const [isLoadingMetadata, setIsLoadingMetadata] = useState(false);
  const [isLoadingAnnotations, setIsLoadingAnnotations] = useState(false);

  // 1. Fetch Metadata (Task -> Dataset -> Project -> Taxonomy)
  useEffect(() => {
    if (!taskId) return;

    let cancelled = false;
    setIsLoadingMetadata(true);

    const loadMetadata = async () => {
      try {
        const api = IS_TEST_MODE 
          ? await import('../services/annotation.api.mock')
          : await import('../services/annotation.api');

        // Fetch Task Details
        const task = await api.getTaskDetails(taskId);
        if (cancelled) return;
        setTaskContext(task);
        
        // Handle Role
        setReadOnly(task.role === 'Viewer');

        // Fetch Dataset -> Project to get Taxonomy
        const dataset = await api.getDatasetDetails(task.dataset_id);
        if (cancelled) return;
        
        const taxonomyData = await api.getProjectTaxonomy(dataset.project_id);
        if (cancelled) return;

        // Map and Set Taxonomy
        // O-1: isActive=false olanlar filtrelenir; sınıflar YOLO/COCO indeks sırasına göre dizilir.
        const mappedClasses: ClassDef[] = taxonomyData.classes
          .filter(c => c.isActive)
          .sort((a, b) => a.index - b.index)
          .map(c => ({
            id: c.id,
            name: c.name,
            color: c.color,
            count: 0,
          }));

        const mappedRelations: RelationType[] = taxonomyData.predicates
          .filter(p => p.isActive)
          .map(p => ({
            id: p.id,
            name: p.name,
            directed: true, // Default to true as per Visual Genome/Scene Graph style
          }));

        setTaxonomy(mappedClasses, mappedRelations);
      } catch (error) {
        console.error('Failed to load metadata:', error);
      } finally {
        if (!cancelled) setIsLoadingMetadata(false);
      }
    };

    loadMetadata();
    return () => { cancelled = true; };
  }, [taskId, setTaskContext, setReadOnly, setTaxonomy]);

  // 2. Fetch Image Annotations
  useEffect(() => {
    if (!imageId || isLoadingMetadata) return;

    let cancelled = false;
    setIsLoadingAnnotations(true);

    const loadAnnotations = async () => {
      try {
        const api = IS_TEST_MODE 
          ? await import('../services/annotation.api.mock')
          : await import('../services/annotation.api');

        const data = await api.getAnnotations(imageId);
        if (cancelled) return;

        const classMap = new Map(taxonomy.classes.map(c => [c.id, c]));
        const uiObjects = data.objects.map((obj, i) => mapApiObjectToUI(obj, classMap, i));
        const objectsMap = new Map(uiObjects.map(o => [o.id, o]));
        const uiRelations = data.relationships.map(r => mapApiRelationToUI(r, objectsMap, taxonomy.predicates));

        setAnnotatedObjects(uiObjects);
        setObjectRelations(uiRelations);
      } catch (error) {
        console.error('Failed to load annotations:', error);
      } finally {
        if (!cancelled) setIsLoadingAnnotations(false);
      }
    };

    loadAnnotations();
    return () => { cancelled = true; };
  }, [imageId, isLoadingMetadata, taxonomy, setAnnotatedObjects, setObjectRelations]);

  return {
    classes: taxonomy.classes,
    relationTypes: taxonomy.predicates,
    isLoading: isLoadingMetadata || isLoadingAnnotations,
    isLoadingAnnotations
  };
}
